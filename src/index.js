// import materialize from 'materialize-css/dist/css/materialize.min.css';
import style from "./_scss/main.scss";
import M from 'materialize-css';

const randomNumber = Math.floor(Math.random() * 5);
const music = require("./assets/music" + randomNumber + ".ogg");

// import arrowUp from "./img/arrow_up.svg";
// import arrowNeutral from "./img/arrow_neutral.svg";
// import arrowDown from "./img/arrow_down.svg";
import smoke from "./img/smoke.png";
import darkSky from "./img/darkSky.png";
import cloudDisplacement from "./img/cloudDisplacement.jpg";

import {
    Howl
} from 'howler';

import {
    TimelineMax,
    Power2,
    TweenLite
} from "gsap/all";

import * as THREE from 'three';

import * as PIXI from 'pixi.js';
import {
    TwistFilter
} from '@pixi/filter-twist';

var scene, sceneLight, portalLight, cam, renderer, clock, portalParticles = [],
    smokeParticles = [];

function initScene() {
    scene = new THREE.Scene();

    sceneLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneLight.position.set(0, 0, 1);
    scene.add(sceneLight);

    portalLight = new THREE.PointLight(0x9900ff, 30, 600, 1.7);
    portalLight.position.set(-20, 0, 150);
    scene.add(portalLight);

    cam = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 2.5, 25000);
    cam.position.x = 500;
    cam.position.z = 1000;
    scene.add(cam);

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    particleSetup();
}

function particleSetup() {
    let loader = new THREE.TextureLoader();
    loader.load(smoke, function (texture) {
        let portalGeo = new THREE.PlaneBufferGeometry(150, 150);
        let portalMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true
        });
        let smokeGeo = new THREE.PlaneBufferGeometry(400, 400);
        let smokeMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true
        });
        for (let p = 800; p > 50; p--) {
            let particle = new THREE.Mesh(portalGeo, portalMaterial);
            particle.position.set(
                0.25 * p * Math.cos((6 * p * Math.PI) / 180),
                0.5 * p * Math.sin((6 * p * Math.PI) / 180),
                0.1 * p
            );
            particle.rotation.z = Math.random() * 360;
            TweenLite.from(particle.scale, 5, {
                    x: 0.0001,
                    y: 0.0001,
                    z: 0.0001,
                    ease: Bounce.easeIn
                },
                0.2);
            TweenLite.from(particle.position, 5, {
                    x: 0.0001,
                    y: 0.0001,
                    z: 0.0001,
                    ease: Bounce.easeIn
                },
                0.2);
            portalParticles.push(particle);
            scene.add(particle);
        }
        for (let p = 0; p < 30; p++) {
            let particle = new THREE.Mesh(smokeGeo, smokeMaterial);
            particle.position.set(
                Math.random() * 400 - 100,
                Math.random() * 350 - 200,
                25
            );
            particle.rotation.z = Math.random() * 360;
            TweenLite.from(particle.scale, 3, {
                x: 0.05,
                y: 0.05,
                z: 0.05,
                ease: Bounce.easeIn,
                delay: 2
            });
            particle.material.opacity = 0.6;
            portalParticles.push(particle);
            scene.add(particle);
        }
        clock = new THREE.Clock();
        animate();
    });
}

function animate() {
    let delta = clock.getDelta();
    portalParticles.forEach(p => {
        p.rotation.z -= delta * 1.5;
    });
    smokeParticles.forEach(p => {
        p.rotation.z -= delta * 0.2;
    });
    if (Math.random() > 0.9) {
        portalLight.power = 350 + Math.random() * 500;
    }
    renderer.render(scene, cam);
    requestAnimationFrame(animate);
}


// PIXIJS 
var app, image, displacementSprite, displacementFilter;
var pixiCanvas = document.querySelector('.pixiCanvas');

function initPIXI() {
    app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        view: pixiCanvas
    });
    document.body.appendChild(app.view);

    image = new PIXI.Sprite.from(darkSky);
    image.width = app.screen.width;
    image.height = app.screen.height;
    app.stage.addChild(image);

    displacementSprite = new PIXI.Sprite.from(cloudDisplacement);
    displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    let twistFilter = new TwistFilter(250, 7, 4);
    twistFilter.offset = [window.innerWidth / 2, window.innerHeight / 2];
    app.stage.addChild(displacementSprite);
    app.stage.filters = [displacementFilter, twistFilter];

    app.renderer.view.style.transform = 'scale(1.02)';
    displacementSprite.scale.x = 3;
    displacementSprite.scale.y = 3;
    animatePIXI();
}

function animatePIXI() {
    displacementSprite.x += 3;
    displacementSprite.y += 3;
    requestAnimationFrame(animatePIXI);
}



let mainContainers = document.querySelectorAll('body main section');
window.addEventListener('resize', function () {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    cam.aspect = WIDTH / HEIGHT;
    cam.updateProjectionMatrix();

    app.renderer.resize(window.innerWidth, window.innerHeight);
    image.scale.set((window.innerWidth / 1366) / (window.innerHeight / 768));

    // document.querySelector('body main').style.height = HEIGHT + 'px';
    // [...mainContainers].forEach(el=> el.style.height = HEIGHT + 'px');
});


document.addEventListener('DOMContentLoaded', function () {

    var sound = new Howl({
        src: [music],
        volume: 0.2,
        loop: true,
        onend: function () {
            soundEqualizerPauseLine.classList.remove("inactive");
            soundEqualizerBars.forEach(el => el.classList.add("inactive"));
        },
        onpause: function () {
            soundEqualizerPauseLine.classList.remove("inactive");
            soundEqualizerBars.forEach(el => el.classList.add("inactive"));
        },
        onplay: function () {
            soundEqualizerPauseLine.classList.add("inactive");
            soundEqualizerBars.forEach(el => el.classList.remove("inactive"));
        }
    });


    var navIcon = document.querySelector('#nav-icon');
    var floatingButtonTrigger = document.querySelector('.floating-button-trigger');
    var floatingButtonContainer = document.querySelector('.floating-buttons');
    floatingButtonTrigger.addEventListener('click', function () {
        navIcon.classList.toggle('moveSticks');
        navIcon.classList.toggle('open');
        floatingButtonContainer.classList.toggle('showButtons');
    })


    var soundEqualizer = document.querySelector('.equaliser-container');
    var soundEqualizerBars = document.querySelectorAll('.equaliser-container .equaliser-column');
    var soundEqualizerButton = document.querySelector('.equaliser-container button');
    var soundEqualizerPauseLine = document.querySelector('.equaliser-container .no-sound');
    soundEqualizerButton.addEventListener('click', () => {
        if (sound.playing(sound)) {
            sound.pause();
        } else {
            sound.play();
        }
    })

    var dotIcons = document.querySelectorAll('.dotstyle ul li');
    var dotIconsContainer = document.querySelector('.dotstyle');
    [...dotIcons].forEach(element => {
        element.addEventListener('click', function () {
            this.classList.toggle('moveSticks');
            this.classList.toggle('open');
        });
    });

    var preloader = document.querySelector('.preloader');
    var preloaderPortal = document.querySelector('.preloader-portal');

    function preloaderTimeline() {
        var Tween_preloader = new TimelineMax({
            onComplete: function () {
                preloader.style.display = "none";
            }
        });
        Tween_preloader.to(
            preloaderPortal,
            0.3, {
                scale: 10
            },
            2
        )
        return Tween_preloader;
    }

    function navIconTimeline() {
        var Tween_navIcon = new TimelineMax({
            onComplete: () => {
                initScene();
                initPIXI();
            }
        });
        Tween_navIcon.to(
            navIcon,
            0.2, {
                x: -500,
                autoAlpha: 0
            }, 0
        ).to(
            navIcon,
            0.6, {
                x: 0,
                autoAlpha: 1,
                ease: Elastic.easeIn.config(1, 0.5)
            }, 0.2
        ).to(
            navIcon,
            0.6, {
                className: "+=moveSticks"
            }, 0.4
        );
        return Tween_navIcon;
    }

    function dotIconsTimeline() {
        var Tween_dotIcons = new TimelineMax();
        Tween_dotIcons.to(
            dotIconsContainer,
            0.2, {
                y: -100,
                autoAlpha: 0
            }, 0
        ).to(
            dotIconsContainer,
            0.6, {
                y: 50,
                autoAlpha: 1,
                ease: Power1.easeIn
            }, 0.3
        ).to(
            dotIconsContainer,
            0.1, {
                y: 0
            },
            0.9
        )
        return Tween_dotIcons;
    }

    function soundEqualizerTimeline() {
        var Tween_sound = new TimelineMax();
        Tween_sound.to(
            soundEqualizer,
            0.3, {
                scale: 1,
                autoAlpha: 1,
                ease: Power4.ease
            }, 0.5
        );
        return Tween_sound;
    }

    function playSound() {
        sound.play();
        soundEqualizerTimeline().play();
        document.removeEventListener('mouseover', playSound);
    }
    var InitTimelineEntry = new TimelineMax({
        paused: true,
        onComplete: function () {
            homeTimelineEntry.play();
            // document.addEventListener('mouseover', playSound);
        }
    }).add(preloaderTimeline()).add(navIconTimeline()).add(dotIconsTimeline());

    InitTimelineEntry.play();



    //Home Page Animations and Functions
    let homeSection = document.querySelector('body main section.home');
    let homeText = document.querySelector(".home .home__title");

    function homeTextTimelineEntry() { //Timeline For Enter Home Page Animation
        var Tween_hometext = new TimelineMax();
        Tween_hometext.to(
            homeText,
            0.2, {
                autoAlpha: 1,
                // scale: 1,
                x: 0,
                ease: SlowMo.ease.config(0.7, 0.7, false)
            }, 0.3
        )
        return Tween_hometext;
    }

    function homeTextTimelineExit() { //Timeline For Exit Home Page Animation
        var Tween_hometext = new TimelineMax();
        Tween_hometext.to(
            homeText,
            0.2, {
                autoAlpha: 0,
                // scale: 0.8,
                x: -(window.innerWidth / 3),
                ease: Bounce.easeOut
            }, 0.2
        )
        return Tween_hometext;
    }

    var homeTimelineEntry = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onStart: function () {
            homeSection.style.display = 'block';
            homeText.classList.add("typewriter");
        }
    }).add(homeTextTimelineEntry());


    var homeTimelineExit = new TimelineMax({
        paused: true,
        onComplete: function () {
            homeText.classList.remove("typewriter");
            homeSection.style.display = 'none';
        }
    }).add(homeTextTimelineExit());



    // Skills Section Animation and Functions
    let skillSection = document.querySelector('body main section.skills');
    var skillIcons = document.querySelectorAll(".single-skill");
    var skillTags = document.querySelectorAll(".skills-info .chip");
    var skillLine = document.querySelectorAll(".header-bottom-line");
    var skillIconsLabel = document.querySelectorAll(".skills-title");
    var svgTooltips = document.querySelectorAll('.tooltipped');

    // Show tooltips of Skills when hovered
    var tooltipInstance = M.Tooltip.init(svgTooltips, {
        transitionMovement: 1,
        margin: 1
    });

    let textSplit = (element) => {
        let text = element.textContent;
        let splitText = [...text].map(el => {
            let separatextContainer = document.createElement('div');
            separatextContainer.classList.add('single-text');
            el !== ' ' ? separatextContainer.innerHTML = el : separatextContainer.innerHTML = ' - ';
            return separatextContainer;
        });
        element.innerHTML = '';
        splitText.forEach(char => element.append(char));
        return element;
    }
    let splitSkillLabels = [...skillIconsLabel].map(el => textSplit(el));

    // Show skills level arrow beside skill images
    function showSkillLevel(arr) {
        arr.map(el => {
            if (el.dataset.level === "up")
                el.classList.add('high');
            else if (el.dataset.level === "neutral")
                el.classList.add('neutral');
            else if (el.dataset.level === "down")
                el.classList.add('low');
        })
    }
    showSkillLevel([...svgTooltips]);

    function randomAnimationDelay(arr) {
        const animatedDelayArray = arr.map(el => el.style.animationDelay = (Math.random() * 4).toFixed(2) + "s");
    }

    function skillTagsTimelineEntry() {
        var Tween_skillTags = new TimelineMax();
        Tween_skillTags.staggerFrom(
            skillTags,
            0.8, {
                y: -100,
                autoAlpha: 0,
                ease: Power2.easeIn
            },
            0.3
        )
        return Tween_skillTags;
    }

    function skillTagsTimelineExit() {
        var Tween_skillTags = new TimelineMax();
        Tween_skillTags.staggerTo(
            skillTags,
            0.1, {
                y: -100,
                autoAlpha: 0,
                ease: Power2.easeIn
            },
            0
        )
        return Tween_skillTags;
    }

    function skillLineTimelineEntry() {
        var Tween_skillLine = new TimelineMax();
        Tween_skillLine.staggerFrom(
            skillLine,
            0.2, {
                scale: 0,
                autoAlpha: 0,
                ease: Power2.easeIn
            },
            0.2
        )
        return Tween_skillLine;
    }

    function skillLineTimelineExit() {
        var Tween_skillLine = new TimelineMax();
        Tween_skillLine.staggerTo(
            skillLine,
            0.1, {
                scale: 0,
                autoAlpha: 0,
                ease: Power2.easeIn
            },
            0
        )
        return Tween_skillLine;
    }

    function skillLabelsTimelineEntry() {
        function randomVal(min, max) {
            return (Math.random() * (max - min)) + min;
        }
        var Tween_skillLabels = new TimelineMax();
        splitSkillLabels.forEach(titleEl => {
            [...titleEl.children].forEach(titleChar => {
                Tween_skillLabels.from(
                    titleChar,
                    0.8, {
                        opacity: 0,
                        scale: .1,
                        x: randomVal(-200, 200),
                        y: randomVal(-200, 200),
                        z: randomVal(-200, 200),
                    }, 0.3
                );
            })
        })
        return Tween_skillLabels;
    }

    function skillLabelsTimelineExit() {
        function randomVal(min, max) {
            return (Math.random() * (max - min)) + min;
        }
        var Tween_skillLabels = new TimelineMax();
        splitSkillLabels.forEach(titleEl => {
            [...titleEl.children].forEach(titleChar => {
                Tween_skillLabels.to(
                    titleChar,
                    0.1, {
                        opacity: 0,
                        scale: .1,
                        x: randomVal(-200, 200),
                        y: randomVal(-200, 200),
                        z: randomVal(-200, 200),
                    }, 0
                );
            })
        })
        return Tween_skillLabels;
    }

    function skillListsTimelineEntry() {
        var Tween_skillLists = new TimelineMax();
        skillIcons.forEach(el => {
            Tween_skillLists.to(
                el,
                0.4, {
                    autoAlpha: 1,
                    ease: Power4.easeIn
                }, 0.5
            )
        })
        return Tween_skillLists;
    }

    function skillListsTimelineExit() {
        var Tween_skillLists = new TimelineMax();
        skillIcons.forEach(el => {
            Tween_skillLists.to(
                el,
                0.1, {
                    autoAlpha: 0,
                    ease: Power4.easeIn
                }, 0
            )
        })
        return Tween_skillLists;
    }

    var skillTimelineEntry = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onStart: function () {
            skillSection.style.display = 'block';
            randomAnimationDelay([...skillIcons]);
        }
    }).add(skillListsTimelineEntry()).add(skillLabelsTimelineEntry()).add(skillTagsTimelineEntry()).add(skillLineTimelineEntry());

    var skillTimelineExit = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onComplete: function () {
            skillSection.style.display = 'none';
        }
    }).add(skillListsTimelineExit()).add(skillLabelsTimelineExit()).add(skillTagsTimelineExit()).add(skillLineTimelineExit());



    // Projects Section Animation and Functions
    var projectSection = document.querySelector("body main section.projects");
    var projectSingle = document.querySelectorAll(".single-project");
    var firstProject = projectSingle[0];
    var lastProject = projectSingle[1];

    function projectListsTimelineEntry() {
        var Tween_projectLists = new TimelineMax();
        Tween_projectLists.to(
            firstProject,
            0.5, {
                scaleX: 1,
                ease: Power4.easeIn
            }, 0.3
        ).to(
            lastProject,
            0.5, {
                scaleY: 1,
                ease: Power4.easeIn
            }, 0.2
        )
        return Tween_projectLists;
    }

    function projectListsTimelineExit() {
        var Tween_projectLists = new TimelineMax();
        Tween_projectLists.to(
            lastProject,
            0.3, {
                scaleY: 0,
                ease: Power1.easeIn
            }, 0.2
        ).to(
            firstProject,
            0.3, {
                scaleX: 0,
                ease: Power1.easeIn
            }, 0.2
        )
        return Tween_projectLists;
    }

    var projectTimelineEntry = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onStart: function () {
            projectSection.style.display = 'block';
        }
    }).add(projectListsTimelineEntry());

    var projectTimelineExit = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onComplete: function () {
            projectSection.style.display = 'none';
        }
    }).add(projectListsTimelineExit());




    // Contact Section Animation and Functions
    var contactSection = document.querySelector("body main section.contact");
    var contactForm = document.querySelectorAll(".contact__header");

    function contactFormTimelineEntry() {
        var Tween_contactForm = new TimelineMax();
        Tween_contactForm.staggerFrom(
            contactForm,
            0.5, {
                y: 100,
                autoAlpha: 0,
                repeat: 2,
                yoyo: true,
                ease: Sine
            }, 0.1
        )
        return Tween_contactForm;
    }

    function contactFormTimelineExit() {
        var Tween_contactForm = new TimelineMax();
        Tween_contactForm.to(
            contactForm,
            0.3, {
                autoAlpha: 0,
                ease: Power4.easeOut
            }, 0
        )
        return Tween_contactForm;
    }

    var contactTimelineEntry = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onStart: function () {
            contactSection.style.display = 'block';
        }
    }).add(contactFormTimelineEntry());

    var contactTimelineExit = new TimelineMax({ //Group Multiple HomeEntry Timelines and Custom Effects
        paused: true,
        onComplete: function () {
            contactSection.style.display = 'none';
        }
    }).add(contactFormTimelineExit());




    //Navigation Handler
    let navPages = document.querySelectorAll("main section");

    function pageIndexHandler() {
        let currentPageIndex = 0;
        let incPageIndex = function () {
            if (currentPageIndex === 3) return currentPageIndex;
            return ++currentPageIndex;
        }
        let decPageIndex = function () {
            if (currentPageIndex === 0) return currentPageIndex;
            return --currentPageIndex;
        }
        let setPageIndex = function (customPageIndex) {
            if (customPageIndex >= 0 && customPageIndex < 4) return currentPageIndex = customPageIndex;
            return currentPageIndex;
        }
        return {
            increment: incPageIndex,
            decrement: decPageIndex,
            set: setPageIndex
        };
    }

    let pageIndex = pageIndexHandler();
    let currentPageIndex = 0;
    let scrolledPageIndex = 1; //Page Index for scrollnaviagated route
    const idlePeriod = 100; //Time to wait for section navigation animation
    const animationDuration = 2000; //Average time to wait for animation
    let lastAnimation = 0;

    let navigationAnimations = [
        [homeTimelineEntry, homeTimelineExit],
        [skillTimelineEntry, skillTimelineExit],
        [projectTimelineEntry, projectTimelineExit],
        [contactTimelineEntry, contactTimelineExit],
    ];

    function getDelta(e) {
        var e_delta = (e.deltaY || -e.wheelDelta || e.detail);
        var delta = e_delta && ((e_delta >> 10) || 1) || 0;
        return delta;
    }

    function pauseCurrentSectionAnimation(currentPageIndex) {
        navigationAnimations[currentPageIndex][0].kill(); //Pause Current Section (Entry) Animation
        navigationAnimations[currentPageIndex][1].restart(); //Play Current Section Exiting Animation
    }

    function navigatePages(scrolledPageIndexVal, currentPageIndexVal) {
        scrolledPageIndex = scrolledPageIndexVal;
        currentPageIndex = currentPageIndexVal;

        // No animation if first or last page
        if (scrolledPageIndex === currentPageIndex) return;

        //Init time to stop rapid navigation between paes
        let timeNow = new Date().getTime();
        let navDots = document.querySelectorAll('.dotstyle li');
        let activeDot = document.querySelector('.dotstyle li.current');
        activeDot.classList.remove('current');
        navDots[scrolledPageIndex].classList.add('current');

        //Pause current nav animation to show another nav animation
        pauseCurrentSectionAnimation(currentPageIndex);

        //Smooth transition to respective page
        setTimeout(() => {
            navPages[scrolledPageIndex].scrollIntoView('smooth');
        }, 1200);

        //Start Scrolled navigation animation
        navigationAnimations[scrolledPageIndex][0].restart().delay(0.7);

        // Set current page pointer to Scrolled page
        currentPageIndex = scrolledPageIndex;

        lastAnimation = timeNow;
    }


    let dotNavigation = document.querySelectorAll('.dotstyle li a');
    [...dotNavigation].forEach((el, index) => el.addEventListener('click', (e) => {
        let pageToNavigate = index;
        scrolledPageIndex = pageIndex.set(pageToNavigate);
        navigatePages(scrolledPageIndex, currentPageIndex);
    }));

    window.addEventListener('wheel', function (event) {
        // Get Scroll Movement Up or Down
        let delta = getDelta(event);
        let timeNow = new Date().getTime();

        // Cancel scroll if currently animating or within quiet period
        if (timeNow - lastAnimation < idlePeriod + animationDuration) {
            // event.preventDefault();
            return;
        } else {
            if (delta < 0) {
                scrolledPageIndex = pageIndex.decrement();
            } else {
                scrolledPageIndex = pageIndex.increment();
            }

            navigatePages(scrolledPageIndex, currentPageIndex);
        }
    });
});