const scoreEl = document.getElementById('scoreEl');
const bigScoreEl = document.getElementById('bigScoreEl');
const modalEl = document.getElementById('modalEl');
const startButton = document.querySelector('.startButton')
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const x = canvas.width / 2;
const y = canvas.height / 2;

let blasts = [];
let baddies = [];
let particles = [];
let animationId;
let score = 0;
let player = new Player(x, y, 20, 'whitesmoke')

function init() {
    blasts = [];
    baddies = [];
    particles = [];
    score = 0;
    player = new Player(x, y, 20, 'whitesmoke')
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnBaddies() {
    setInterval(() => {
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const radius = (Math.random() * 25) + 7;
        let spawnX;
        let spawnY;

        if (Math.random() < .5) {
            spawnX = Math.random() < .5 ? 0 - radius : canvas.width + radius;
            spawnY = Math.random() * canvas.height;
        } else {
            spawnX = Math.random() * canvas.width;
            spawnY = Math.random() < .5 ? 0 - radius : canvas.height + radius;
        }

        const angle = Math.atan2(y - spawnY, x - spawnX);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        baddies.push(new Baddie(
            spawnX, spawnY, radius, color, velocity
        ));
    }, 1000);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, .1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    blasts.forEach((blast, index) => {
        blast.update();

        if (blast.x + blast.radius < 0 ||
            blast.x - blast.radius > canvas.width ||
            blast.y + blast.radius < 0 ||
            blast.y - blast.radius > canvas.height) {
            setTimeout(() => {
                blasts.splice(index, 1);
            }, 0);
        }
    });
    baddies.forEach((baddie, baddieIdx) => {
        baddie.update();
        const distance = Math.hypot(player.x - baddie.x, player.y - baddie.y);
        if (distance - baddie.radius - player.radius < 0) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }

        blasts.forEach((blast, blastIdx) => {
            const distance = Math.hypot(blast.x - baddie.x, blast.y - baddie.y);

            // enemy and projectile collision
            if (distance - baddie.radius - blast.radius < 0) {

                for (let i = 0; i < baddie.radius * 3; i++) {
                    particles.push(new Particle(blast.x, blast.y, Math.random() * 2, baddie.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 8),
                            y: (Math.random() - 0.5) * (Math.random() * 8)
                        }));
                }

                if (baddie.radius - 10 > 5) {

                    score += 100;
                    scoreEl.innerHTML = score;

                    gsap.to(baddie, { radius: baddie.radius - 10 });
                    setTimeout(() => {
                        blasts.splice(blastIdx, 1);
                    }, 0);
                } else {
                    score += 250;
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        baddies.splice(baddieIdx, 1);
                        blasts.splice(blastIdx, 1);
                    }, 0);
                }
            }
        });
    });
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - y, event.clientX - x);
    const velocity = {
        x: Math.cos(angle) * 7,
        y: Math.sin(angle) * 7
    }
    blasts.push(new Blast(
        x, y, 10, 'whitesmoke', velocity
    ))

});

startButton.addEventListener('click', () => {
    init();
    animate();
    spawnBaddies();
    modalEl.style.display = 'none';
});