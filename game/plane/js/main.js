// подсчет длинны гипотенузы по теореме Пифагора
const Distance = (a, b) => {
    return Math.sqrt(Math.pow(Math.abs(a.left - b.left), 2) + Math.pow(Math.abs(a.top - b.top), 2));
};

// функция которая вычисляет координаты центра блока
const center = el => {
    let object = el.getBoundingClientRect();

    // координаты относительно документа
    // (pageYOffset и pageXOffset это размер прокрутки, если она есть)
    let y = object.top + pageYOffset;
    let x = object.left + pageXOffset;

    return {
        top: y + el.offsetHeight / 2, // y + половина высоты
        left: x + el.offsetWidth / 2, // x + половина ширины
    };
};

let lifeIterator = 0;

const collision = (plane, evil) => {
    plane.getBoundingClientRect();
    evil.getBoundingClientRect();

    let radius1 = plane.offsetHeight / 2;
    let radius2 = evil.offsetHeight / 2;

    // растояние между центрами объектов
    let distance = Distance(center(plane), center(evil));

    if (distance < radius1 + radius2) {
        if (lifeIterator < 2) {
            evil.remove();
            document
                .querySelector('plane-element')
                .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, iterations: 5 });
            lifeIterator = lifeIterator + 1;
        } else {
            evil.remove();
            planeMain.src = './images/bomb1.gif';
            setTimeout(() => {
                plane.remove();
                document.querySelector('#enterWindow').innerHTML = templateAgain;
            }, 1000);
        }
    }
};

let planeMain = null;
let planeMainAudio = null;

window.addEventListener('load', () => {
    const endGame = () => {
        window.close();
    };
    const startGame = () => {
        enterWindow.innerHTML = '';
        {
            class PlaneElement extends HTMLElement {
                constructor() {
                    super();
                    const shadow = this.attachShadow({ mode: 'closed' });
                    const plane = shadow.appendChild(document.createElement('img'));
                    const planeLocation = plane.offsetLeft;
                    const left = innerWidth * 0.15;
                    const top = innerHeight * 0.5;

                    plane.src = `./images/plane1.gif`;

                    plane.style = `
                        left: ${left}px;
                        top: ${top}px;
                        position: absolute;
                        width: 200px;
                        height: 130px;
                        transform: scaleX(-1) rotateZ(0deg);
                        transition: all 4s;
                        z-index: 1;
                        
                    `;

                    const planeAudio = new Audio();
                    planeAudio.src = './sounds/propeller.mp3';

                    planeAudio.volume = 0.2;

                    planeMain = plane;
                    planeMainAudio = planeAudio;

                    plane.move = function (event) {
                        // planeAudio.play();
                        // console.log(plane.offsetLeft);

                        switch (event.key) {
                            case 'ArrowUp':
                                if (top > 0) {
                                    plane.style.top = `${top - document.documentElement.clientHeight / 2 + 50}px`;
                                    plane.style.transform = 'scaleX(-1) rotateZ(10deg)';
                                    planeAudio.volume = 0.4;
                                }
                                break;

                            case 'ArrowLeft': // если нажата клавиша влево
                                if (left > 0) {
                                    plane.style.left = `${left - 150}px`;
                                    plane.style.transform = 'scaleX(-1) rotateZ(0deg)';
                                    planeAudio.volume = 0.3;
                                }
                                break;

                            case 'ArrowRight': // если нажата клавиша влево
                                if (left > 0) {
                                    plane.style.left = `${left + 150}px`;
                                    plane.style.transform = 'scaleX(-1) rotateZ(0deg)';
                                    planeAudio.volume = 0.3;
                                }
                                break;

                            case 'ArrowDown': // если нажата клавиша вниз
                                if (top < document.documentElement.clientHeight - 200) {
                                    plane.style.top = `${top + document.documentElement.clientHeight / 2 - 100}px`;
                                    plane.style.transform = 'scaleX(-1) rotateZ(-10deg)';
                                    planeAudio.volume = 0.2;
                                }

                                break;
                        }
                        requestAnimationFrame(plane.move);
                    };
                    requestAnimationFrame(plane.move);

                    addEventListener('keydown', plane.move);
                }
            }

            customElements.define('plane-element', PlaneElement);

            document.body.appendChild(document.createElement('plane-element'));
        }

        {
            class EvilPlaneElement extends HTMLElement {
                constructor() {
                    super();
                    const shadow = this.attachShadow({ mode: 'closed' });
                    const evilPlane = shadow.appendChild(document.createElement('img'));
                    const left = innerWidth + 50;
                    const top = Math.round(Math.random() * innerHeight - 150);
                    evilPlane.src = `./images/evilPlane.gif`;
                    evilPlane.style = `
                    left: ${left}px;
                    top: ${top}px;
                    position: absolute;
                    width: 170px;
                    height: 120px;
                    transition: all 10s;
                    `;

                    evilPlane.move = function move() {
                        if (evilPlane.offsetLeft < innerWidth * 0.33) {
                            collision(planeMain, evilPlane);
                        }
                        if (evilPlane.offsetLeft > 0) {
                            if (evilPlane.offsetTop < document.documentElement.clientHeight * 0.6) {
                                evilPlane.style.left = `${left - document.documentElement.clientWidth - 350}px`;
                                evilPlane.style.top = `${top + 500}px`;
                            }
                            if (evilPlane.offsetTop >= document.documentElement.clientHeight * 0.75) {
                                evilPlane.style.left = `${left - document.documentElement.clientWidth - 350}px`;
                                evilPlane.style.top = `${top - 800}px`;
                            }
                        }
                        if (evilPlane.offsetLeft < -150) {
                            document.querySelector('evil-plane-element').remove();
                        }

                        requestAnimationFrame(evilPlane.move);
                    };

                    requestAnimationFrame(evilPlane.move);
                }
            }

            customElements.define('evil-plane-element', EvilPlaneElement);

            const recursion = (function () {
                let counter = 0;
                return function recurse() {
                    setTimeout(() => {
                        const evilPlane = document.createElement('evil-plane-element');
                        document.body.appendChild(evilPlane);
                    }, 1500 * counter);
                    counter++ < 28 && recurse();
                };
            })();
            recursion();
        }

        {
            class CloudElement extends HTMLElement {
                constructor() {
                    super();
                    const shadow = this.attachShadow({ mode: 'closed' });
                    const cloud = shadow.appendChild(document.createElement('img'));
                    const left = innerWidth + 50;
                    const zInsex = Math.round(Math.random() * 10) - 4;
                    const size = Math.round(Math.max(Math.random() * 150, 80));
                    cloud.src = `./images/raincould.gif`;
                    cloud.style = `
                        left: ${left}px;
                        top: ${Math.round(
                            Math.max(
                                Math.random() * document.documentElement.clientHeight * 0.3,
                                document.documentElement.clientHeight * 0.05
                            )
                        )}px;
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        transition: all 15s;
                        z-index:${zInsex};
                    `;
                    cloud.move = function move() {
                        if (cloud.offsetLeft < innerWidth * 0.33) {
                            collision(planeMain, cloud);
                        }
                        if (cloud.offsetLeft > 0) {
                            cloud.style.left = `${left - document.documentElement.clientWidth - 350}px`;
                        }
                        if (cloud.offsetLeft < -50) {
                            const cloudStop = document.querySelector('cloud-element');
                            cloudStop.remove();
                        }

                        requestAnimationFrame(cloud.move);
                    };

                    requestAnimationFrame(cloud.move);
                }
            }

            customElements.define('cloud-element', CloudElement);

            const recursion = (function () {
                let counter = 0;
                return function recurse() {
                    setTimeout(
                        () => document.body.appendChild(document.createElement('cloud-element')),
                        2500 * counter
                    );
                    counter++ < 15 && recurse();
                };
            })();
            recursion();
        }
    };

    const templateStart = `

            <h3 id="text" > Начать игру </h3>

            <h6 id="rules"></h6>
            
            <button id= "enter"> Да </button>
            <button id= "exit"> Нет </button>

            <style>
            #text{
                text-align: center;
                font-size: 25px;
            }
            #rules{
                margin: 10px;
                font-size: 20px;
            }
            button{
                margin: 5px 0 15px 0;
                min-width: 60px;
                padding: 5px 12px;
                border-radius: 5px;
            }
            #enter{
                color: #bc8787;
                background: #adff2f;
            }
            #exit{
                color: #ffffff;
                background: #ca684c;

            }
            #enterWindow{
                text-align: center;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                background: #aa86b0;
                border-radius: 20px;
                z-index: 5;
            }
            </style>
    `;

    const enterWindow = document.body.appendChild(document.createElement('div'));
    enterWindow.id = 'enterWindow';
    enterWindow.innerHTML = templateStart;
    document.querySelector('#rules').innerHTML =
        'Добро пожаловать. Вы бесстрашный пилот.<br> Нужно избегать препятствий, управление на курсорах.<br> Удачи';

    document.body.addEventListener('click', e => {
        if (e.target.id === 'exit') {
            endGame();
        } else if (e.target.id === 'enter') {
            startGame();
        } else if (e.target.id === 'again') {
            window.location.reload();
        }
    });
});

const templateAgain = `

            <h3 id="text" > Ну как-то так..... </h3>

            <button id= "again"> Ещё разок? </button>

            <button id= "exit"> Нет </button>

            <style>
            #text{
                text-align: center;
                font-size: 25px;
            }
            button{
                margin: 5px 0 15px 0;
                min-width: 60px;
                padding: 5px 12px;
                border-radius: 5px;
            }
            #again{
                color: #bc8787;
                background: #adff2f;
            }
            #exit{
                color: #ffffff;
                background: #ca684c;

            }
            #enterWindow{
                text-align: center;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                background: #aa86b0;
                border-radius: 20px;
                z-index: 5;
            }
            </style>
    `;
