document.addEventListener('DOMContentLoaded', () => {

    // === 1. КОНФИГУРАЦИЯ И ЗВУКОВОЙ ДВИЖОК ===
    let audioEnabled = true;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSynthSound(freq, type, duration) {
        if (!audioEnabled) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    // === 2. КАСТОМНЫЙ КУРСОР ВЫСОКОГО ПОРЯДКА (ИСПРАВЛЕННЫЙ) ===
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    
    let mouseX = -100, mouseY = -100;   
    let cursorX = -100, cursorY = -100; 
    const easeSpeed = 0.15; 

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    function animateCursor() {
        if (cursor) {
            cursorX += (mouseX - cursorX) * easeSpeed;
            cursorY += (mouseY - cursorY) * easeSpeed;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    function updateHoverListeners() {
        const interactiveElements = document.querySelectorAll('button, input, .dot, .nav-btn, a');
        interactiveElements.forEach(elem => {
            elem.removeEventListener('mouseenter', addHover);
            elem.removeEventListener('mouseleave', removeHover);
            elem.addEventListener('mouseenter', addHover);
            elem.addEventListener('mouseleave', removeHover);
        });
    }
    function addHover() { if (cursor) cursor.classList.add('hovered'); }
    function removeHover() { if (cursor) cursor.classList.remove('hovered'); }
    updateHoverListeners();
    // === 3. КВАНТОВЫЙ ФОН CANVAS ===
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let globalSpeedMultiplier = 1;

    function initCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    initCanvas();
    window.addEventListener('resize', initCanvas);

    class QuantumParticle {
        constructor() {
            this.x = Math.random() * (canvas ? canvas.width : window.innerWidth);
            this.y = Math.random() * (canvas ? canvas.height : window.innerHeight);
            this.baseX = this.x; 
            this.baseY = this.y;
            this.size = Math.random() * 2 + 0.5;
            this.density = (Math.random() * 30) + 10; 
        }
        update() {
            let dx = mouseX - this.x;
            let dy = mouseY - this.y;
            let distance = Math.hypot(dx, dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;

            if (distance < maxDistance) {
                let directionX = forceDirectionX * force * this.density * globalSpeedMultiplier;
                let directionY = forceDirectionY * force * this.density * globalSpeedMultiplier;
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= (dx / 15) * globalSpeedMultiplier;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= (dy / 15) * globalSpeedMultiplier;
                }
            }
        }
        draw() {
            if (ctx) {
                ctx.fillStyle = 'rgba(0, 255, 204, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    if (canvas && ctx) {
        for (let i = 0; i < 90; i++) { particles.push(new QuantumParticle()); }
    }

    function animateSpace() {
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateSpace);
        }
    }
    animateSpace();

    // === 4. ИНТЕРФЕЙСНЫЙ МЕНЕДЖЕР ВКЛАДОК ===
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-section');
            playSynthSound(600, 'sine', 0.08); 
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === targetSection) {
                    sec.classList.add('active');
                    if (targetSection === 'matrix') {
                        if (typeof triggerMatrixCounters === 'function') triggerMatrixCounters();
                        if (typeof initChartEngine === 'function') initChartEngine(); 
                    }
                }
            });
        });
    });
    // === 5. ТИЛТ-ФИЗИКА КАРТОЧЕК МОДУЛЕЙ ===
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${(x / rect.width * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height * 100).toFixed(1)}%`);
            const rotX = (-(y - rect.height/2) / (rect.height/2) * 20).toFixed(2);
            const rotY = ((x - rect.width/2) / (rect.width/2) * 20).toFixed(2);
            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        });
        card.addEventListener('mouseenter', () => {
            playSynthSound(880, 'triangle', 0.04);
            if (cursor) cursor.classList.add('hovered');
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            if (cursor) cursor.classList.remove('hovered');
        });
    });

      // === 6. СИМУЛЯТОР ТЕРМИНАЛА ALT LINUX (NEXUS EDITION) ===
    const logBox = document.getElementById('terminal-log');
    const consoleInput = document.getElementById('console-input');
    const altPrompt = document.getElementById('alt-prompt');

    // Базовые переменные для симуляции ОС
    let currentDir = "~"; 
    let cmdHistory = [];  // История команд для стрелочек
    let historyIndex = -1;

    // Виртуальная файловая система Альта
    const fileSystem = {
        "~": { type: "dir", content: ["documents", "nexus_core.cfg", "readme.txt"] },
        "~/documents": { type: "dir", content: ["matrix_passwords.dat", "secret_project.key"] },
        "~/nexus_core.cfg": { type: "file", text: "CORE_VERSION=9.09\nSTATUS=ONLINE\nSECURITY_LEVEL=MAXIMUM\nAUDIO_ENGINE=ENABLED" },
        "~/readme.txt": { type: "file", text: "=== NEXUS-9 QUANTUM CORE ===\nИнтерфейс успешно портирован на базу ALT Linux.\nИспользуйте утилиту 'apt-get install' для добавления модулей." },
        "~/documents/matrix_passwords.dat": { type: "file", text: "root:◆quantum_god_mode_2026◆\nnexus_user:◆password123◆" },
        "~/documents/secret_project.key": { type: "file", text: "RSA PRIVATE KEY:\nMIICXAIBAAKBgQDBwN9f3A4zY..." }
    };

    function appendTerminalLog(text, isError = false, customColor = null) {
        if (!logBox) return;
        const row = document.createElement('div');
        row.className = `log-row ${isError ? 'error' : ''}`;
        if (customColor) row.style.color = customColor;
        
        row.textContent = text;
        logBox.appendChild(row);
        logBox.scrollTop = logBox.scrollHeight;
    }

    if (consoleInput) {
        // 1. Отслеживание стрелочек Вверх/Вниз для истории команд
        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cmdHistory.length > 0 && historyIndex < cmdHistory.length - 1) {
                    historyIndex++;
                    consoleInput.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    consoleInput.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
                } else if (historyIndex === 0) {
                    historyIndex = -1;
                    consoleInput.value = '';
                }
            }
        });

        // 2. Основной обработчик команд (Enter)
        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const fullInput = consoleInput.value.trim();
                consoleInput.value = '';
                if (!fullInput) return;

                // Сохраняем в историю
                cmdHistory.push(fullInput);
                historyIndex = -1;

                // Печатаем строку ввода в лог терминала
                const currentPromptText = altPrompt ? altPrompt.textContent : "altuser@alt-nexus9:~ \$";
                appendTerminalLog(`${currentPromptText} ${fullInput}`);

                // Разбиваем строку на команду и аргумент
                const parts = fullInput.split(' ');
                const command = parts[0].toLowerCase();
                const argument = parts[1];

                if (typeof playSynthSound === 'function') playSynthSound(400, 'sawtooth', 0.04);

                switch (command) {
                    case 'help':
                    case 'info':
                        appendTerminalLog("Доступные команды ALT Linux симулятора:");
                        appendTerminalLog("  ls              - Показать файлы в текущей папке");
                        appendTerminalLog("  cd [папка]      - Перейти в другую папку (пример: cd documents, cd ..)");
                        appendTerminalLog("  cat [файл]      - Прочитать содержимое текстового файла");
                        appendTerminalLog("  whoami          - Информация о текущем пользователе");
                        appendTerminalLog("  uname -a        - Вывод информации о ядре ОС");
                        appendTerminalLog("  apt-get         - Симуляция установки пакетов (пример: apt-get install)");
                        appendTerminalLog("  clear / cls     - Очистить экран терминала");
                        appendTerminalLog("  overload        - Экстренная перегрузка ядра");
                        break;

                    case 'whoami':
                        appendTerminalLog("altuser (Квантовый оператор интерфейса Nexus-9)");
                        break;

                    case 'uname':
                        if (argument === '-a') {
                            appendTerminalLog("Linux alt-nexus9 6.1.0-alt1-quantum-smp #1 SMP Sat Oct 17 2026 x86_64 ALT Linux");
                        } else {
                            appendTerminalLog("Linux");
                        }
                        break;

                    case 'ls':
                        const dirData = fileSystem[currentDir];
                        if (dirData && dirData.content) {
                            dirData.content.forEach(item => {
                                const path = currentDir === "~" ? `~/${item}` : `${currentDir}/${item}`;
                                const isDir = fileSystem[path] && fileSystem[path].type === "dir";
                                appendTerminalLog(`  ${item}`, false, isDir ? "#55ffff" : "#00ffcc");
                            });
                        }
                        break;

                    case 'cd':
                        if (!argument || argument === '~') {
                            currentDir = "~";
                            if (altPrompt) altPrompt.textContent = "altuser@alt-nexus9:~ \$";
                        } else if (argument === '..') {
                            if (currentDir !== "~") {
                                currentDir = "~";
                                if (altPrompt) altPrompt.textContent = "altuser@alt-nexus9:~ \$";
                            }
                        } else {
                            const targetPath = currentDir === "~" ? `~/${argument}` : `${currentDir}/${argument}`;
                            if (fileSystem[targetPath] && fileSystem[targetPath].type === "dir") {
                                currentDir = targetPath;
                                if (altPrompt) altPrompt.textContent = `altuser@alt-nexus9:${argument} $`;
                            } else {
                                appendTerminalLog(`cd: папка '${argument}' не найдена`, true);
                            }
                        }
                        break;

                    case 'cat':
                        if (!argument) {
                            appendTerminalLog("Использование: cat [имя_файла]", true);
                        } else {
                            const filePath = currentDir === "~" ? `~/${argument}` : `${currentDir}/${argument}`;
                            if (fileSystem[filePath] && fileSystem[filePath].type === "file") {
                                appendTerminalLog(fileSystem[filePath].text, false, "#ffffff");
                            } else {
                                appendTerminalLog(`cat: файл '${argument}' не найден или является папкой`, true);
                            }
                        }
                        break;

                    case 'apt-get':
                    case 'apt':
                        if (argument === 'install') {
                            const packageName = parts[2] || "cmatrix";
                            appendTerminalLog(`Чтение списков пакетов... Готово`);
                            appendTerminalLog(`Построение дерева зависимостей... Готово`);
                            appendTerminalLog(`Следующие НОВЫЕ пакеты будут установлены: ${packageName}`);
                            appendTerminalLog(`Получено:1 http://altlinux.org [142 kB]`);
                            appendTerminalLog(`Установка и настройка пакета ${packageName}... [OK]`, false, "#55ff55");
                        } else {
                            appendTerminalLog("Используйте: apt-get install [имя_пакета]", true);
                        }
                        break;

                    case 'ip':
                        if (argument === 'a' || argument === 'addr' || argument === 'address') {
                            appendTerminalLog("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000");
                            appendTerminalLog("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00");
                            appendTerminalLog("    inet 127.0.0.1/8 scope host lo", false, "#55ff55");
                            appendTerminalLog("       valid_lft forever preferred_lft forever");
                            appendTerminalLog("2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000");
                            appendTerminalLog("    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff");
                            // Выводим твой квантовый IP-адрес в сети Nexus
                            appendTerminalLog("    inet 192.168.9.109/24 brd 192.168.9.255 scope global dynamic eth0", false, "#55ff55");
                            appendTerminalLog("       valid_lft 86400sec preferred_lft 86400sec");
                        } else {
                            appendTerminalLog("Использование: ip a или ip address", true);
                        }
                        break;

                    case 'clear':
                    case 'cls':
                        if (logBox) logBox.innerHTML = '';
                        break;

                    case 'overload':
                        const overloadTrigger = document.getElementById('system-overload');
                        if (overloadTrigger) overloadTrigger.click();
                        break;

                    default:
                        appendTerminalLog(`alt-bash: command not found: ${command}. Введите 'help' для списка утилит.`, true);
                }
            }
        });
    }

    // Кнопка аудиоэффектов
    const audioToggleBtn = document.getElementById('audio-toggle');
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            audioEnabled = !audioEnabled;
            audioToggleBtn.textContent = `Аудиоэффекты: ${audioEnabled ? 'ВКЛ' : 'ВЫКЛ'}`;
            if (typeof playSynthSound === 'function') playSynthSound(500, 'sine', 0.1);
        });
    }

    // === 7. ДИНАМИЧЕСКИЙ ДВИЖОК МАТРИЦЫ (БЕЗ ОСТАНОВКИ НА 100%) ===
    let matrixInterval = null;
    let matrixLogInterval = null;

    window.triggerMatrixCounters = function() {
        const counterEl = document.getElementById('matrix-counter');
        const logBox = document.getElementById('matrix-log-box');
        if (!counterEl || !logBox) return;

        clearInterval(matrixInterval);
        clearInterval(matrixLogInterval);
        logBox.innerHTML = '';

        // Проценты циклично колеблются, симулируя живую нагрузку
        matrixInterval = setInterval(() => {
            let base = Math.sin(Date.now() / 2000) * 15 + 83; 
            let jitter = Math.random() * 2.5;
            let finalValue = Math.min(100, base + jitter);
            counterEl.textContent = finalValue.toFixed(2) + '%';
        }, 150);

        // Поток бесконечных кибер-логов
        const mockLogs = [
            "SYS_PACKET: Поток энергии перенаправлен на узел ",
            "QUANTUM_CORE: Изменение частоты модуляции до ",
            "MATRIX_SYNC: Данные ядра верифицированы шифрованием ",
            "NET_NODE: Пакет данных успешно доставлен, пинг ",
            "SYS_ALERT: Коррекция термодинамического баланса "
        ];

        matrixLogInterval = setInterval(() => {
            const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
            let variable = (Math.random() * 100).toFixed(2);
            
            const row = document.createElement('div');
            row.style.marginBottom = '4px';
            row.style.opacity = '0';
            row.style.transition = 'opacity 0.3s';
            row.textContent = `[${new Date().toLocaleTimeString()}] > ${randomLog}${variable}`;
            
            logBox.appendChild(row);
            setTimeout(() => row.style.opacity = '0.7', 10);
            logBox.scrollTop = logBox.scrollHeight;

            if (logBox.children.length > 20) {
                logBox.removeChild(logBox.children[0]);
            }
        }, 600);
    };

    window.initChartEngine = function() {
        console.log("Информационный движок матрицы переведен в бесконечный потоковый режим.");
    };


    // === 8. СИСТЕМА МОДАЛЬНЫХ ОКН ДЛЯ СЕКЦИИ МОДУЛЕЙ ===
    const modal = document.getElementById('module-modal');
    const modalContent = document.getElementById('modal-content-box');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body-text');
    const modalActionBtn = document.getElementById('modal-action-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const moduleData = {
        ai: {
            title: "NEURAL NETWORK CORE",
            text: "Протокол синхронизации нейросети Nexus-09 активен. Текущий синаптический объем: 14.8 PFLOPS. Сбоев матрицы сознания не обнаружено. Архитектура работает на 94.2% эффективности.",
            color: "var(--neon-blue)"
        },
        security: {
            title: "CYBER SECURITY PROTOCOL",
            text: "Квантовый файрвол активен. Обнаружено и заблокировано 12 скрытых попыток сканирования портов. Ключ шифрования обновляется каждые 30 секунд. Уровень угрозы: НУЛЕВОЙ.",
            color: "var(--neon-pink)"
        },
        hardware: {
            title: "HARDWARE SYNC ENGINE",
            text: "Аппаратные мосты разогнаны до базовой частоты 5.4 ГГц. Температура квантового диссипатора: -184°C (жидкий азот в норме). Энергопотребление стабильно, шина данных свободна.",
            color: "var(--neon-purple)"
        }
    };

    const moduleCards = document.querySelectorAll('.tilt-card');
    moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const modId = card.getAttribute('data-module');
            const data = moduleData[modId];
            if (!data) return;

            modalTitle.textContent = data.title;
            modalTitle.style.color = data.color;
            modalBody.textContent = data.text;
            modalContent.style.borderColor = data.color;
            modalContent.style.boxShadow = `0 0 35px ${data.color}`;
            
            modalActionBtn.style.borderColor = data.color;
            modalActionBtn.style.color = data.color;
            modalActionBtn.textContent = `ПЕРЕЗАГРУЗИТЬ ${modId.toUpperCase()}`;

            modal.style.display = 'flex';
            if (typeof playSynthSound === 'function') playSynthSound(700, 'sine', 0.15);
        });
    });

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (typeof playSynthSound === 'function') playSynthSound(300, 'sine', 0.05);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (typeof playSynthSound === 'function') playSynthSound(300, 'sine', 0.05);
            }
        });
    }

    if (modalActionBtn) {
        modalActionBtn.addEventListener('click', () => {
            if (typeof playSynthSound === 'function') playSynthSound(300, 'sawtooth', 0.2);
            modalActionBtn.textContent = "ПЕРЕЗАГРУЗКА...";
            modalBody.textContent = "[СИСТЕМНЫЙ СИГНАЛ]: Инициализирован полный сброс кэша регистров и холодная перезагрузка квантового ядра модуля...";
            
            setTimeout(() => {
                modal.style.display = 'none';
                const termLog = document.getElementById('terminal-log');
                if (termLog) {
                    const r = document.createElement('div');
                    r.className = 'log-row';
                    r.style.color = 'var(--neon-blue)';
                    r.textContent = `[${new Date().toLocaleTimeString()}] > Модуль успешно перезапущен удаленной командой интерфейса.`;
                    termLog.appendChild(r);
                }
            }, 1500);
        });
    }
    // === 9. РЕЖИМ КРИТИЧЕСКОЙ ПЕРЕГРУЗКИ СИСТЕМЫ (OVERLOAD) ===
    const overloadBtn = document.getElementById('system-overload');
    const globalStatus = document.getElementById('global-status');
    let isOverloaded = false;

    if (overloadBtn) {
        overloadBtn.addEventListener('click', () => {
            isOverloaded = !isOverloaded;
            
            if (isOverloaded) {
                // Включаем режим паники
                document.body.classList.add('overload-active');
                if (globalStatus) {
                    globalStatus.textContent = "CORRUPTED // OVERLOAD";
                    globalStatus.style.color = "#ff003c";
                }
                overloadBtn.textContent = "STABILIZE";
                overloadBtn.style.background = "#ff003c";
                overloadBtn.style.color = "#fff";
                
                // Разгоняем частицы на фоне до безумной скорости (переменная из секции canvas)
                globalSpeedMultiplier = 12; 
                
                // Врубаем сирену через твой звуковой движок
                if (typeof playSynthSound === 'function') {
                    playSynthSound(150, 'sawtooth', 0.8);
                    setTimeout(() => playSynthSound(180, 'sawtooth', 0.8), 200);
                }
                
                // Пишем отчет в терминал, если он открыт
                if (typeof appendTerminalLog === 'function') {
                    appendTerminalLog("КРИТИЧЕСКАЯ ОШИБКА: Инициализирована перегрузка квантового ядра!", true);
                    appendTerminalLog("ВНИМАНИЕ: Сдерживающие поля отключены!", true);
                }
            } else {
                // Возвращаем всё в стабильное состояние
                document.body.classList.remove('overload-active');
                if (globalStatus) {
                    globalStatus.textContent = "ONLINE";
                    globalStatus.style.color = "";
                }
                overloadBtn.textContent = "OVERLOAD";
                overloadBtn.style.background = "";
                overloadBtn.style.color = "";
                
                // Возвращаем нормальную скорость частицам
                globalSpeedMultiplier = 1;
                
                if (typeof playSynthSound === 'function') playSynthSound(600, 'sine', 0.3);
                if (typeof appendTerminalLog === 'function') {
                    appendTerminalLog("Протоколы стабилизации успешно выполнены. Ядро в норме.");
                }
            }
        });
    }

}); // Проект успешно закрыт и готов к работе!
