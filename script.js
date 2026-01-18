function scrollToStats() {
    const target = document.getElementById('stats-anchor');
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add("active");
        }
    });
}

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);

const cursor = document.querySelector('.cursor');
let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
let isCursorVisible = false;


document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isCursorVisible) {
        posX = mouseX;
        posY = mouseY;
        cursor.style.display = 'block';
        isCursorVisible = true;
    }
});


document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    isCursorVisible = false;
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});


function animateCursor() {
    if (isCursorVisible) {
        posX += (mouseX - posX) * 0.15;
        posY += (mouseY - posY) * 0.15;
        cursor.style.transform = `translate(${posX - 6}px, ${posY - 6}px)`;
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

const PLUGIN_ID = 28720;

async function updateStats() {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const sRes = await fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}/charts/servers/data`);
        const sData = await sRes.json();
        
        if (sData && sData.length > 0) {
            const currentServers = sData[sData.length - 1][1];
            const recordServers = Math.max(...sData.map(e => e[1]));
            
            document.getElementById('serv-curr').innerText = currentServers;
            document.getElementById('serv-rec').innerText = recordServers;
        }

        const pRes = await fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}/charts/players/data`);
        const pData = await pRes.json();
        
        if (pData && pData.length > 0) {
            const currentPlayers = pData[pData.length - 1][1];
            const recordPlayers = Math.max(...pData.map(e => e[1]));
            
            document.getElementById('play-curr').innerText = currentPlayers;
            document.getElementById('play-rec').innerText = recordPlayers;
        }
    } catch (e) {
        console.error("Ошибка при получении данных bStats:", e);
        document.querySelectorAll('.stat-value, .record-value').forEach(el => {
            if (el.querySelector('.loading-dots')) {
                el.innerText = "0";
            }
        });
    }
}
updateStats();
