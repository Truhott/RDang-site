function scrollToStats() {
    const target = document.getElementById('stats-anchor');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ── Scroll reveal (throttled) ── */
let revealTicking = false;

function reveal() {
    if (revealTicking) return;
    revealTicking = true;
    requestAnimationFrame(() => {
        const windowHeight = window.innerHeight;
        const threshold = 100;
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < windowHeight - threshold) {
                el.classList.add('active');
            }
        });
        revealTicking = false;
    });
}

window.addEventListener('scroll', reveal, { passive: true });
window.addEventListener('load', reveal);

/* ── Custom cursor (pointer devices only) ── */
const cursor = document.querySelector('.cursor');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (cursor && hasFinePointer) {
    let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
    let isCursorVisible = false;
    let cursorActive = false;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isCursorVisible) {
            posX = mouseX;
            posY = mouseY;
            cursor.style.display = 'block';
            isCursorVisible = true;
            cursorActive = true;
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        isCursorVisible = false;
        cursorActive = false;
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });

    document.querySelectorAll('a, button, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    function animateCursor() {
        if (cursorActive) {
            posX += (mouseX - posX) * 0.15;
            posY += (mouseY - posY) * 0.15;
            const size = cursor.classList.contains('hovered') ? 22 : 6;
            cursor.style.transform = `translate(${posX - size}px, ${posY - size}px)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

/* ── Back to top ── */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ── Animated counter ── */
function animateValue(el, end, duration = 1200) {
    const start = 0;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (end - start) * eased).toLocaleString('ru-RU');
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function setStatValue(id, value, animate = true) {
    const el = document.getElementById(id);
    if (!el) return;
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animateValue(el, value);
    } else {
        el.textContent = value.toLocaleString('ru-RU');
    }
}

function setStatError(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '—';
            el.classList.add('stat-error');
        }
    });
}

async function fetchChart(pluginId, chart) {
    const res = await fetch(`https://bstats.org/api/v1/plugins/${pluginId}/charts/${chart}/data`);
    if (!res.ok) throw new Error(`bStats ${chart}: ${res.status}`);
    return res.json();
}

function processStats(data, storageKey) {
    if (!data?.length) return null;
    const current = data[data.length - 1][1];
    const apiRecord = Math.max(...data.map(e => e[1]));
    const stored = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const record = Math.max(apiRecord, stored);
    localStorage.setItem(storageKey, record);
    return { current, record };
}

async function updateMainStats() {
    if (!document.getElementById('serv-curr')) return;

    try {
        const [sData, pData] = await Promise.all([
            fetchChart(28720, 'servers'),
            fetchChart(28720, 'players')
        ]);

        const servers = processStats(sData, 'recordServers');
        const players = processStats(pData, 'recordPlayers');

        if (servers) {
            setStatValue('serv-curr', servers.current);
            setStatValue('serv-rec', servers.record);
        }
        if (players) {
            setStatValue('play-curr', players.current);
            setStatValue('play-rec', players.record);
        }
    } catch (e) {
        console.error('Ошибка bStats:', e);
        setStatError(['serv-curr', 'serv-rec', 'play-curr', 'play-rec']);
    }
}

async function updateArchiveStats() {
    if (!document.getElementById('arc-serv-curr')) return;

    try {
        const [sData, pData] = await Promise.all([
            fetchChart(26611, 'servers'),
            fetchChart(26611, 'players')
        ]);

        const servers = processStats(sData, 'arcRecordServers');
        const players = processStats(pData, 'arcRecordPlayers');

        if (servers) {
            setStatValue('arc-serv-curr', servers.current);
            setStatValue('arc-serv-rec', servers.record);
        }
        if (players) {
            setStatValue('arc-play-curr', players.current);
            setStatValue('arc-play-rec', players.record);
        }
    } catch (e) {
        console.error('Ошибка загрузки архива:', e);
        setStatError(['arc-serv-curr', 'arc-serv-rec', 'arc-play-curr', 'arc-play-rec']);
    }
}

updateMainStats();
updateArchiveStats();
