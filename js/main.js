
(function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let codeSymbols = [];
    let mouse = { x: null, y: null };


    const isMobile = window.innerWidth < 768;
    const config = {
        particleCount: isMobile ? 30 : 80,
        symbolCount: isMobile ? 5 : 15,
        particleColor: 'rgba(56, 189, 248, 0.5)',
        lineColor: 'rgba(56, 189, 248, 0.1)',
        symbolColor: 'rgba(56, 189, 248, 0.2)',
        maxDistance: isMobile ? 100 : 150,
        particleSpeed: 0.4,
        symbols: ['</', '/>', '{}', '()', '[]', '=>', '/*', '*/']
    };


    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.baseSize = this.size;
            this.speedX = (Math.random() - 0.5) * config.particleSpeed;
            this.speedY = (Math.random() - 0.5) * config.particleSpeed;
            this.glowIntensity = 0;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;


            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;


            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 200;

                if (distance < maxDist) {

                    const force = (1 - distance / maxDist) * 0.08;
                    this.x -= dx * force;
                    this.y -= dy * force;


                    this.glowIntensity = (1 - distance / maxDist);
                    this.size = this.baseSize + this.glowIntensity * 3;
                } else {
                    this.glowIntensity = Math.max(0, this.glowIntensity - 0.02);
                    this.size = this.baseSize + this.glowIntensity * 3;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);


            if (this.glowIntensity > 0) {
                ctx.shadowBlur = 15 * this.glowIntensity;
                ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
                ctx.fillStyle = `rgba(56, 189, 248, ${0.5 + this.glowIntensity * 0.5})`;
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = config.particleColor;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }


    class CodeSymbol {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.symbol = config.symbols[Math.floor(Math.random() * config.symbols.length)];
            this.size = Math.random() * 14 + 12;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.angle = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 0.5;
        }

        update() {
            this.y += this.speedY;
            this.angle += this.rotationSpeed;


            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.font = `${this.size}px 'Courier New', monospace`;
            ctx.fillStyle = `rgba(56, 189, 248, ${this.opacity})`;
            ctx.textAlign = 'center';
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }


    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.maxDistance) {
                    const opacity = 1 - (distance / config.maxDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }


            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - particles[i].x;
                const dy = mouse.y - particles[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const cursorMaxDist = 180;

                if (distance < cursorMaxDist) {
                    const opacity = (1 - distance / cursorMaxDist) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        }
    }


    function init() {
        particles = [];
        codeSymbols = [];

        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }

        for (let i = 0; i < config.symbolCount; i++) {
            codeSymbols.push(new CodeSymbol());
        }
    }


    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        codeSymbols.forEach(symbol => {
            symbol.update();
            symbol.draw();
        });


        drawLines();


        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        animationId = requestAnimationFrame(animate);
    }


    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });


    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });


    resizeCanvas();
    init();
    animate();
})();


const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
}


document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});


const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-reveal').forEach(el => {
    observer.observe(el);
});


(function () {
    const container = document.getElementById('floatingTestimonials');
    if (!container || window.innerWidth < 768) return;

    const testimonialSnippets = [
        '"Excellent work!"',
        '"Delivered on time"',
        '"Professional team"',
        '"Clean design"',
        '"Highly recommend"',
        '"Fast loading site"',
        '"Great value"',
        '"Modern aesthetics"'
    ];


    testimonialSnippets.forEach((text, index) => {
        const snippet = document.createElement('div');
        snippet.className = 'floating-snippet';
        snippet.textContent = text;
        snippet.style.top = `${10 + (index * 12)}%`;
        snippet.style.left = `${5 + (index % 4) * 25}%`;
        snippet.style.animationDelay = `${index * 2.5}s`;
        container.appendChild(snippet);
    });


    let currentHighlight = 0;
    const snippets = container.querySelectorAll('.floating-snippet');

    function highlightSnippet() {
        snippets.forEach(s => s.classList.remove('in-view'));
        if (snippets[currentHighlight]) {
            snippets[currentHighlight].classList.add('in-view');
        }
        currentHighlight = (currentHighlight + 1) % snippets.length;
    }


    setInterval(highlightSnippet, 4000);
    highlightSnippet();
})();


(function () {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    if (!testimonialCards.length) return;

    const testimonialObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-focus');
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-50px'
    });

    testimonialCards.forEach(card => {
        testimonialObserver.observe(card);
    });
})();


(function () {
    const wordSequence = document.getElementById('heroWordSequence');
    const videoIntro = document.getElementById('videoIntro');
    const words = document.querySelectorAll('.sequence-word');

    if (!wordSequence || !words.length) return;


    const animationShown = sessionStorage.getItem('introAnimationShown');

    if (animationShown) {

        wordSequence.classList.add('hidden');
        if (videoIntro) {
            videoIntro.classList.add('hidden');
        }
        return;
    }


    sessionStorage.setItem('introAnimationShown', 'true');


    if (videoIntro) {
        videoIntro.style.opacity = '0';
        videoIntro.style.visibility = 'hidden';
    }

    let currentWord = 0;
    const wordDuration = 700; // each word visible for 700ms
    const overlapTime = 200; // next word starts appearing as previous fades

    function showNextWord() {
        if (currentWord > 0 && words[currentWord - 1]) {
            words[currentWord - 1].classList.remove('active');
            words[currentWord - 1].classList.add('exit');
        }

        if (currentWord < words.length) {

            setTimeout(() => {
                if (words[currentWord]) {
                    words[currentWord].classList.add('active');
                }
                currentWord++;
                setTimeout(showNextWord, wordDuration);
            }, overlapTime);
        } else {

            setTimeout(() => {
                wordSequence.classList.add('collapsed');


                if (videoIntro) {
                    videoIntro.style.opacity = '1';
                    videoIntro.style.visibility = 'visible';
                    videoIntro.style.animation = 'none';

                    setTimeout(() => {
                        videoIntro.style.animation = 'introFadeOut 0.8s ease forwards';
                        setTimeout(() => {
                            videoIntro.classList.add('hidden');
                        }, 800);
                    }, 1500);
                }

                setTimeout(() => {
                    wordSequence.classList.add('hidden');
                }, 500);
            }, 300);
        }
    }


    setTimeout(showNextWord, 300);


    wordSequence.addEventListener('click', () => {
        wordSequence.classList.add('collapsed');
        wordSequence.classList.add('hidden');
        if (videoIntro) {
            videoIntro.classList.add('hidden');
        }
    });
})();


document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('open');
    });
});


const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});



// IMPORTANT: Replace this URL with your deployed Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7n582w1jbsR500OhdMSM1Smh5z_sCuxBHgE0zNAA0wFGJFTgV3K7OgE9Kqap2Pk4heQ/exec';


const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const notification = document.getElementById('form-notification');


function showNotification(message, type) {
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'success' ? '✅ ' : '❌ '}${message}
            <button onclick="this.closest('.form-notification').classList.add('hidden')" 
                    style="margin-top: 15px; padding: 8px 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; cursor: pointer; display: block; margin-left: auto; margin-right: auto;">
                Close
            </button>
        </div>`;
    notification.className = `form-notification ${type}`;


    setTimeout(() => {
        notification.classList.add('hidden');
    }, 8000);
}


function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Sending...';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Send Message';
    }
}


function validateForm(data) {
    if (!data.name.trim()) {
        return { valid: false, message: 'Please enter your name.' };
    }
    if (!data.email.trim() || !data.email.includes('@')) {
        return { valid: false, message: 'Please enter a valid email address.' };
    }
    if (!data.mobile.trim() || data.mobile.replace(/[\s\-\+]/g, '').length < 10) {
        return { valid: false, message: 'Please enter a valid mobile number.' };
    }
    return { valid: true };
}


function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();


        const formData = {
            timestamp: getTimestamp(),
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            mobile: document.getElementById('mobile').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value || 'No message provided'
        };


        const validation = validateForm(formData);
        if (!validation.valid) {
            showNotification(validation.message, 'error');
            return;
        }


        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            showNotification('Form system not configured yet. Please contact via WhatsApp or email.', 'error');
            return;
        }


        setLoading(true);

        try {

            const formBody = new URLSearchParams();
            formBody.append('timestamp', formData.timestamp);
            formBody.append('name', formData.name);
            formBody.append('email', formData.email);
            formBody.append('mobile', formData.mobile);
            formBody.append('service', formData.service);
            formBody.append('message', formData.message);

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody.toString()
            });


            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('Failed to send message. Please try WhatsApp or email instead.', 'error');
        } finally {
            setLoading(false);
        }
    });
}
