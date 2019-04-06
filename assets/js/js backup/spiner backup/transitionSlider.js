/* 
Transition Slider jQuery plugin
version 1.0.1
author http://codecanyon.net/user/creativeinteractivemedia/portfolio?ref=creativeinteractivemedia
*/
(function($) {
    "use strict";

    function TransitionSlider(elem, options) {
        var self = this;

        self.$sliderWrapper = $(elem);
        self.ev = $(self);

        extendOptions(options);
        setupEventListeners();
        generateHTMLElementsForSwiper();
        updateMainWrapperSize();
        self.updateSizeValuesOnResize();
        addStyleToSwiper();
        calculateSlidesValuesFromOptions();
        initLoading();
        initTransition();
        initSwiper();

        function extendOptions(options) {
            self.options = $.extend(true, {}, $.fn.transitionSlider.defaults, options);
            extendEffectOptions();
            setupMediaTypeAndExtensionForSlides();

            function extendEffectOptions() {
                if (self.options.navigation) {
                    var newOptions = {};

                    for (var key in STX.Utils.navigation) {
                        newOptions[key] = STX.Utils.navigation[key] + self.options.navigation.style;
                    }
                    self.options.navigation = newOptions;
                }

                if (self.options.pagination) {
                    var newOptions = {};

                    for (var key in STX.Utils.pagination) {
                        if (key === "type") {
                            for (var key in STX.Utils.pagination.type) {
                                if (STX.Utils.pagination.type[key].includes(self.options.pagination.style)) {
                                    newOptions["type"] = key;
                                }
                            }
                        } else {
                            if (key === "bulletClass" || key === "bulletActiveClass") {
                                newOptions[key] = STX.Utils.pagination[key] + self.options.pagination.style;
                            } else if (key === "modifierClass" && newOptions["type"] === "fraction") {
                                newOptions[key] = STX.Utils.pagination[key] + self.options.pagination.style + "-";
                                if (self.options.pagination.textColor) document.documentElement.style.setProperty("--paggination-color", self.options.pagination.textColor);
                            } else {
                                newOptions[key] = STX.Utils.pagination[key];
                            }
                        }
                    }
                    self.options.pagination = $.extend(self.options.pagination, newOptions);
                }
            }

            function setupMediaTypeAndExtensionForSlides() {
                self.options.slides.forEach(function(slide) {
                    slide.mediaType = STX.Utils.checkForSupportedMediaType(slide.src).mediaType;
                    slide.mediaExtension = STX.Utils.checkForSupportedMediaType(slide.src).mediaExtension;
                });
            }
        }

        function setupEventListeners() {
            self.ev.on("initSwiper", function() {
                self.initAfterAssetsLoad();
            });
            self.ev.on("enableSwiperInteraction", function() {
                self.enableSwiper();
            });
            self.ev.on("disableSwiperInteraction", function() {
                self.disableSwiper();
            });
            self.ev.on("onPauseButtonUpdate", function(event, paused) {
                paused ? self.pauseSwiper() : self.resumeSwiper();
            });
        }

        function generateHTMLElementsForSwiper() {
            self.$sliderWrapper.css({ position: "relative", margin: "auto" });
            if (self.options.shadow) {
                self.$sliderWrapper.css({ marginBottom: "15px" });
            }

            if (!self.container) {
                self.container = document.createElement("div");
                self.container.setAttribute("class", "stx-container");
            }

            if (!self.swiperWrapperDiv) {
                self.swiperContainerDiv = document.createElement("div");
                self.swiperContainerDiv.className = "swiper-container";
                self.swiperWrapperDiv = document.createElement("div");
                self.swiperWrapperDiv.className = "swiper-wrapper";
                self.swiperContainerDiv.appendChild(self.swiperWrapperDiv);

                self.$sliderWrapper.append($(self.swiperContainerDiv));
                self.$sliderWrapper.prepend($(self.container));
            }

            if (self.options.slides) {
                var generateUnmuteButton = false;

                self.options.slides.forEach(function(slide) {
                    var slideDiv = document.createElement("div");
                    slideDiv.className = "swiper-slide";
                    self.swiperWrapperDiv.appendChild(slideDiv);
                    if (!generateUnmuteButton && slide.mediaType === "VIDEO") {
                        generateUnmuteButton = true;
                        self.unmute = new STX.Buttons({
                            ev: self.ev,
                            buttons: self.options.buttons
                        });
                        self.$unmute = self.unmute.getUnmuteDivElement();
                        self.$sliderWrapper.append(self.$unmute);
                    }
                });
            }

            if (self.options.navigation) {
                self.navigationNextDiv = document.createElement("div");
                self.navigationPrevDiv = document.createElement("div");
                self.navigationNextDiv.className = self.options.navigation.nextEl.replace(/^\./, "");
                self.navigationPrevDiv.className = self.options.navigation.prevEl.replace(/^\./, "");
                self.navigationNextDiv.classList.add(self.options.navigation.navigationStyleClass);
                self.navigationPrevDiv.classList.add(self.options.navigation.navigationStyleClass);
                self.swiperContainerDiv.appendChild(self.navigationNextDiv);
                self.swiperContainerDiv.appendChild(self.navigationPrevDiv);
            }

            if (self.options.pagination) {
                self.paginationDiv = document.createElement("div");
                self.paginationDiv.className = self.options.pagination.el.replace(/^\./, "");
                self.swiperContainerDiv.appendChild(self.paginationDiv);
            }

            if (self.options.scrollbar) {
                self.scrollbarDiv = document.createElement("div");
                self.scrollbarDiv.className = self.options.scrollbar.el.replace(/^\./, "");
                self.swiperContainerDiv.appendChild(self.scrollbarDiv);
            }
        }

        function updateMainWrapperSize() {
            self.options.aspectRatio = self.options.width / self.options.height;
            self.$sliderWrapper.width(self.options.width).height(self.options.height);
        }

        function addStyleToSwiper() {
            if (self.options.shadow) self.container.classList.add("sliderTX_" + self.options.shadow);
        }

        function calculateSlidesValuesFromOptions() {
            if (self.options.slides) {
                self.options.transitionDurations = [];
                self.options.slides.forEach(function(slide) {
                    if (slide.transitionDuration === 0 || slide.transitionDuration === null || slide.transitionDuration === undefined) {
                        slide.transitionDuration = self.options.transitionDuration;
                    }
                    if (slide.transitionEffect === "" || slide.transitionEffect === null || slide.transitionEffect === undefined) {
                        slide.transitionEffect = self.options.transitionEffect;
                    }
                    self.options.transitionDurations.push(slide.transitionDuration);
                });
            }
        }

        function initTransition() {
            self.transition = new STX.Transition({
                container: self.container,
                ev: self.ev,
                initialSlide: self.options.initialSlide,
                initialEffect: self.options.slides[self.options.initialSlide].transitionEffect,
                slidesToLoad: self.options.slides,
                camera: {
                    width: self.options.width,
                    height: self.options.height,
                    fov: 75
                }
            });
        }

        function initLoading() {
            self.loading = new STX.Loading(self.options.loading, self.ev);
            self.$sliderWrapper.append($(self.loading.getLoadingDivElement()));
        }

        function initSwiper() {
            self.options.speed = self.options.slides[self.options.initialSlide].transitionDuration;

            self.options.roundLengths = true;
            self.options.watchOverflow = true;
            self.options.preventInteractionOnTransition = true;
            self.options.followFinger = false;

            self.swiper = new Swiper(self.swiperContainerDiv, self.options);

            self.swiper.on("resize", function() {
                self.onResize();
            });

            self.swiper.on(
                "resize",
                debounce(function() {
                    self.ev.trigger("animationComplete", [false]);
                })
            );

            self.swiper.on("slideNextTransitionStart", function() {
                self.nextSlide(self.swiper.previousIndex, self.swiper.realIndex);
            });

            self.swiper.on("slidePrevTransitionStart", function() {
                self.prevSlide(self.swiper.previousIndex, self.swiper.realIndex);
            });

            function debounce(func) {
                var timer;
                return function(event) {
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(func, 250, event);
                };
            }

            if (self.options.autoplay) {
                self.swiper.autoplay.stop();
            }
        }

        function removeHTMLElementsAndStyles() {
            self.swiper.removeAllSlides();

            if (self.options.navigation) {
                $(self.navigationNextDiv).remove();
                $(self.navigationPrevDiv).remove();
            }

            if (self.options.pagination) {
                $(self.paginationDiv).remove();
            }

            if (self.options.scrollbar) {
                $(self.scrollbarDiv).remove();
            }

            if (self.options.shadow) {
                self.container.classList.remove("sliderTX_" + self.options.shadow);
            }

            if (self.$unmute) {
                self.$unmute.remove();
            }
        }

        self.reloadSlider = function(newSliderOptions) {
            removeHTMLElementsAndStyles();
            self.swiper.destroy(false, true);

            extendOptions(newSliderOptions);
            updateMainWrapperSize();
            calculateSlidesValuesFromOptions();
            generateHTMLElementsForSwiper();
            self.stopSlider();
            self.updateSizeValuesOnResize();
            addStyleToSwiper();
            initSwiper();
            self.transition.reloadTransition({
                initialSlide: self.options.initialSlide,
                initialEffect: self.options.slides[self.options.initialSlide].transitionEffect,
                slidesToLoad: self.options.slides,
                camera: {
                    width: self.options.width,
                    height: self.options.height,
                    fov: 75
                }
            });
        };

        self.stopSlider = function() {
            self.transition.pauseAllVideoSlides();
        };
    }

    TransitionSlider.prototype = {
        constructor: TransitionSlider,

        initAfterAssetsLoad: function() {
            var self = this;

            if (self.options.autoplay) self.swiper.autoplay.start();
            self.loading.hideLoading();
        },

        onResize: function() {
            var self = this;

            self.updateSizeValuesOnResize();
            if (self.transition) {
                self.transition.updateTransitionOnResize({
                    width: self.options.width,
                    height: self.options.height
                });
            }
        },

        updateSizeValuesOnResize: function() {
            var self = this;

            if (self.options.responsive) {
                self.$sliderWrapper.width("100%");
                var wrapperHeight = (self.$sliderWrapper.width() / self.options.aspectRatio).toString() + "px";
                self.$sliderWrapper.height(wrapperHeight);
                self.options.width = self.$sliderWrapper.width();
                self.options.height = self.$sliderWrapper.height();
            }
        },

        nextSlide: function(fromSlide, toSlide) {
            var self = this;
            var curr = fromSlide;
            var next = toSlide;
            var slide = self.options.slides[curr];

            self.transition.animate({
                transitionEffect: slide.transitionEffect,
                transitionDuration: slide.transitionDuration,
                direction: slide.direction,
                distance: slide.distance,
                brightness: slide.brightness,
                easing: slide.easing,
                slideFrom: curr,
                slideTo: next
            });
        },

        prevSlide: function(fromSlide, toSlide) {
            var self = this;
            var curr = fromSlide;
            var prev = toSlide;
            var slide = self.options.slides[prev];

            self.transition.animate({
                transitionEffect: slide.transitionEffect,
                transitionDuration: slide.transitionDuration,
                direction: slide.direction,
                distance: slide.distance,
                brightness: slide.brightness,
                easing: slide.easing,
                slideFrom: curr,
                slideTo: prev
            });
        },

        enableSwiper: function() {
            var self = this;

            if (self.options.autoplay) self.swiper.autoplay.start();
            self.swiper.allowSlideNext = true;
            self.swiper.allowSlidePrev = true;
            self.swiper.allowTouchMove = true;
        },

        disableSwiper: function() {
            var self = this;

            if (self.options.autoplay) self.swiper.autoplay.stop();
            self.swiper.allowSlideNext = false;
            self.swiper.allowSlidePrev = false;
            self.swiper.allowTouchMove = false;
        },

        pauseSwiper: function() {
            var self = this;

            if (self.options.autoplay && self.swiper.autoplay.running) self.swiper.autoplay.stop();
        },

        resumeSwiper: function() {
            var self = this;

            if (self.options.autoplay && !self.swiper.autoplay.running) self.swiper.autoplay.start();
        }
    };

    $.ssProto = TransitionSlider.prototype;

    $.fn.transitionSlider = function(options) {
        return this.each(function() {
            var self = $(this);
            if (!self.data("transitionSlider")) {
                self.data("transitionSlider", new TransitionSlider(self, options));
            }
        });
    };

    $.fn.transitionSlider.defaults = {
        width: 1000,
        height: 550,
        shadow: null,
        responsive: true,
        transitionEffect: "roll",
        transitionDuration: 1000,
        initialSlide: 0,
        grabCursor: true,
        buttons: {
            muteVisible: true,
            pauseVisible: true
        },
        loading: {
            spinnerStyle: "loadingTextSpinner",
            fadeEffect: true,
            backgroundColor: "#000"
        },
        keyboard: {
            enabled: true
        },
        navigation: {
            style: "effect4"
        },
        pagination: true,
        autoplay: true,
        stopOnLastSlide: false
    };
})(jQuery, window);

var _0x37ba=['if(u4\x20!=\x200.)','uv\x20=\x20l1(uv);','BrightnessShader','gl_FragColor\x20=\x20vec4(texture2D(\x20transitionFrom,\x20vUv.xy\x20).xyz\x20*\x20u1,\x201.0);','VideoSlideObject','video','createElement','width','height','autoplay','muted','setAttribute','playsinline','src','anonymous','preload','auto','load','texture','VideoTexture','EffectHandler','slide','effects','charAt','slice','transitionEffect','flash','brightness','fade','Effect','roll','stretch','zoom','powerzoom','warp','forEach','indexOf','sliderTextureFrom','currentEffect','resetEffect','enabled','sliderTextureTo','render','assign','prototype','THREE.Effect:\x20.render()\x20must\x20be\x20implemented\x20in\x20derived\x20effect.','error','THREE.Effect:\x20.animate()\x20must\x20be\x20implemented\x20in\x20derived\x20effect.','trigger','enableSwiperInteraction','Easing','Sinusoidal','easeInOutSine','InOut','Out','easeInQuad','Quadratic','easeInOutQuad','easeOutQuad','easeInCubic','Cubic','easeInOutCubic','easeOutCubic','easeInQuintic','Quintic','easeOutQuintic','easeInExponential','easeOutExponential','Exponential','easeOutBack','easeInBounce','Bounce','easeOutBOunce','linear','Linear','None','PowerzoomEffect','THREE.PowerZoomEffect\x20relies\x20on\x20THREE.PowerZoomShader','UniformsUtils','clone','uniforms','transform','defaults','directions','out','transitionFrom','material','ShaderMaterial','vertexShader','fragmentShader','value','update','options','transitionDuration','transitionTo','slideFrom','slideTo','toLowerCase','long','distance','short','Utils','getRandomInt','direction','number','slow','easing','elastic','Elastic','tween','Tween','easing1','onUpdate','onComplete','switchTexture','start','animationComplete','pauseVideoCallback','RollEffect','call','THREE.RollEffect\x20relies\x20on\x20THREE.RollShader','top','bottom','left','right','topleft','topright','bottomleft','bottomright','replace','down','Back','sign','undefined','delay','easing2','StretchEffect','create','WarpEffect','THREE.WarpEffect\x20relies\x20on\x20THREE.WarpShader','ZoomEffect','THREE.ZoomEffect\x20relies\x20on\x20THREE.ZoomShader','BrightnessEffect','THREE.BrightnessEffect\x20relies\x20on\x20THREE.BrightnessShader','transitions','fast','WarpShader','varying\x20vec2\x20vUv;','void\x20main()\x20{','vUv\x20=\x20uv;','join','uniform\x20sampler2D\x20transitionTo;','uniform\x20float\x20u1;','uniform\x20float\x20u2;','uniform\x20float\x20u3;','uniform\x20float\x20u4;','uniform\x20float\x20u5;','uniform\x20float\x20u6;','vec2\x20fe(vec2\x20uv,\x20float\x20f){','vec2\x20c\x20=\x20vec2(.5,.5);','float\x20r\x20=\x20sqrt(dot(d,\x20d));','float\x20power\x20=\x20(\x202.0\x20*\x203.141592\x20/\x20(2.0\x20*\x20sqrt(dot(c,\x20c)))\x20)\x20*\x20f;','float\x20bind\x20=\x20sqrt(dot(c,\x20c));','if\x20(power\x20>\x200.0)','uv\x20=\x20c\x20+\x20normalize(d)\x20*\x20tan(r\x20*\x20power)\x20*\x20bind\x20/\x20tan(\x20bind\x20*\x20power);','uv\x20=\x20c\x20+\x20normalize(d)\x20*\x20atan(r\x20*\x20-power\x20*\x2010.0)\x20*\x20bind\x20/\x20atan(-power\x20*\x20bind\x20*\x2010.0);','return\x20uv;','vec2\x20l1(vec2\x20a){','a.x\x20=\x20mod(a.x,\x202.)\x20>\x201.\x20?\x20mod(1.-a.x,\x201.)\x20:\x20mod(a.x,\x201.);','a.y\x20=\x20mod(a.y,\x202.)\x20>\x201.\x20?\x20mod(1.-a.y,\x201.)\x20:\x20mod(a.y,\x201.);','return\x20a;','vec2\x20uv\x20=\x20vUv.xy;','vec4\x20l2\x20=\x20vec4(0.0,0.0,0.0,0.0);','vec2\x20l3;','vec2\x20t\x20=\x20vec2(u5,\x20u6);','vec2\x20uv2\x20=\x20uv;','if(u1\x20!=\x200.){','uv2=fe(uv,\x20u1);','uv.y\x20=\x20uv2.y;','if(u2\x20!=\x200.){','uv2=fe(uv,\x20u2);','uv.x\x20=\x20uv2.x;','if(u4\x20!=\x200.\x20){','vec2\x20uv3;','l3\x20=\x20u4\x20*\x20vec2(u5,\x20u6);','for\x20(int\x20i\x20=\x200;\x20i\x20<\x2012;\x20i\x20+=\x201)\x20{','uv3\x20=\x20uv+float(i)/float(12)*l3;','uv3\x20=\x20l1(uv3-t);','l2\x20+=\x20texture2D(transitionFrom,uv3);','gl_FragColor\x20=\x20(l2/float(12))\x20*\x20u7;','}else{','uv\x20=\x20l1(uv\x20-\x20t);','gl_FragColor\x20=\x20vec4(texture2D(transitionFrom,uv).xyz\x20*\x20u7,\x201.);','ZoomShader','uniform\x20sampler2D\x20transitionFrom;','float\x20l4\x20=\x20u1\x20<\x200.\x20?\x20-1.\x20/\x20u1\x20:\x20u1;','vec2\x20l5\x20=\x20vec2(1./l4,1./l4);','vec2\x20l6\x20=\x20u2*(l3\x20-\x20uv);','uv3\x20=\x20uv+float(i)/float(12)*l6;','uv3\x20=\x20uv3\x20*\x20l5\x20-\x20l3\x20*\x20l5\x20+\x20l3;','uv3\x20=\x20l1(uv3);','gl_FragColor\x20=\x20l2/float(12)\x20*\x20u3;','uv\x20=\x20uv\x20*\x20l5\x20-\x20l3\x20*\x20l5\x20+\x20l3;','gl_FragColor\x20=\x20vec4(texture2D(transitionFrom,uv).xyz\x20*\x20u3,\x201.);','StretchShader','gl_Position\x20=\x20projectionMatrix\x20*\x20modelViewMatrix\x20*\x20vec4(\x20position,\x201.0\x20);','void\x20main(\x20){','float\x20sx;','sx\x20=\x20u1\x20+\x201.;','uv.x\x20=\x20pow((1.\x20-\x20uv.x)\x20/\x20(pow(sx,sx*sx)),\x201.\x20/\x20sx);','sx\x20=\x20u1\x20-\x201.;','float\x20sy;','if(u2\x20>\x200.){','sy\x20=\x20u2\x20+\x201.;','uv.y\x20=\x20pow((1.\x20-\x20uv.y)\x20/\x20(pow(sy,sy*sy)),\x201.\x20/\x20sy);','uv.y\x20=\x201.\x20-\x20uv.y;','}else\x20if(u2\x20<\x200.){','sy\x20=\x20u2\x20-\x201.;','uv.y\x20=\x20pow(uv.y\x20*\x20(pow(sy,sy*(-sy))),\x201.\x20/\x20-sy);','gl_FragColor\x20=\x20vec4(texture2D(transitionFrom,\x20uv).xyz\x20*\x20u3,\x201.);','RollShader','uniform\x20float\x20u7;','if(u3\x20!=\x200.\x20||\x20u4\x20!=\x200.\x20){','l3\x20=\x20vec2(u3,\x20u4);','PowerZoomShader','vec2\x20fe(vec2\x20uv,\x20vec2\x20c,\x20float\x20f){','vec2\x20d\x20=\x20uv\x20-\x20c;','else\x20if\x20(power\x20<\x200.0)','vec2\x20l3\x20=\x20vec2(.5,.5);'];(function(_0x3066e2,_0x55ae89){var _0x32d9a8=function(_0x4f5341){while(--_0x4f5341){_0x3066e2['push'](_0x3066e2['shift']());}};_0x32d9a8(++_0x55ae89);}(_0x37ba,0x177));var _0x4105=function(_0x13e6d0,_0x4aedfa){_0x13e6d0=_0x13e6d0-0x0;var _0x34306c=_0x37ba[_0x13e6d0];return _0x34306c;};THREE[_0x4105('0x0')]={'uniforms':{'transitionFrom':{'type':'t','value':null},'transitionTo':{'type':'t','value':null},'u1':{'type':'f','value':0x0},'u2':{'type':'f','value':0x0},'u3':{'type':'f','value':0x0},'u4':{'type':'f','value':0x0},'u5':{'type':'f','value':0x0},'u6':{'type':'f','value':0x0},'u7':{'type':'f','value':0x1}},'vertexShader':[_0x4105('0x1'),_0x4105('0x2'),_0x4105('0x3'),'gl_Position\x20=\x20projectionMatrix\x20*\x20modelViewMatrix\x20*\x20vec4(\x20position,\x201.0\x20);','}'][_0x4105('0x4')]('\x0a'),'fragmentShader':['uniform\x20sampler2D\x20transitionFrom;',_0x4105('0x5'),_0x4105('0x1'),_0x4105('0x6'),_0x4105('0x7'),_0x4105('0x8'),_0x4105('0x9'),_0x4105('0xa'),_0x4105('0xb'),'uniform\x20float\x20u7;',_0x4105('0xc'),_0x4105('0xd'),'vec2\x20d\x20=\x20uv\x20-\x20c;',_0x4105('0xe'),_0x4105('0xf'),_0x4105('0x10'),_0x4105('0x11'),_0x4105('0x12'),'else\x20if\x20(power\x20<\x200.0)',_0x4105('0x13'),_0x4105('0x14'),'}',_0x4105('0x15'),_0x4105('0x16'),_0x4105('0x17'),_0x4105('0x18'),'}',_0x4105('0x2'),_0x4105('0x19'),_0x4105('0x1a'),_0x4105('0x1b'),_0x4105('0x1c'),_0x4105('0x1d'),_0x4105('0x1e'),_0x4105('0x1f'),_0x4105('0x20'),'}',_0x4105('0x21'),_0x4105('0x22'),_0x4105('0x23'),'}',_0x4105('0x24'),_0x4105('0x25'),_0x4105('0x26'),_0x4105('0x27'),_0x4105('0x28'),_0x4105('0x29'),_0x4105('0x2a'),'}',_0x4105('0x2b'),_0x4105('0x2c'),_0x4105('0x2d'),_0x4105('0x2e'),'}','}'][_0x4105('0x4')]('\x0a')};THREE[_0x4105('0x2f')]={'uniforms':{'transitionFrom':{'type':'t','value':null},'transitionTo':{'type':'t','value':null},'u1':{'type':'f','value':0x1},'u2':{'type':'f','value':0x0},'u3':{'type':'f','value':0x1}},'vertexShader':['varying\x20vec2\x20vUv;',_0x4105('0x2'),'vUv\x20=\x20uv;','gl_Position\x20=\x20projectionMatrix\x20*\x20modelViewMatrix\x20*\x20vec4(\x20position,\x201.0\x20);','}'][_0x4105('0x4')]('\x0a'),'fragmentShader':[_0x4105('0x30'),_0x4105('0x5'),_0x4105('0x1'),_0x4105('0x6'),_0x4105('0x7'),_0x4105('0x8'),_0x4105('0x15'),'a.x\x20=\x20mod(a.x,\x202.)\x20>\x201.\x20?\x20mod(1.-a.x,\x201.)\x20:\x20mod(a.x,\x201.);','a.y\x20=\x20mod(a.y,\x202.)\x20>\x201.\x20?\x20mod(1.-a.y,\x201.)\x20:\x20mod(a.y,\x201.);',_0x4105('0x18'),'}',_0x4105('0x2'),_0x4105('0x19'),_0x4105('0x1a'),'vec2\x20l3\x20=\x20vec2(.5,.5);',_0x4105('0x31'),_0x4105('0x32'),_0x4105('0x21'),_0x4105('0x33'),_0x4105('0x25'),'for\x20(int\x20i\x20=\x200;\x20i\x20<\x2012;\x20i\x20+=\x201)\x20','{',_0x4105('0x34'),_0x4105('0x35'),_0x4105('0x36'),_0x4105('0x2a'),'}',_0x4105('0x37'),_0x4105('0x2c'),_0x4105('0x38'),'uv\x20=\x20l1(uv);',_0x4105('0x39'),'}','}'][_0x4105('0x4')]('\x0a')};THREE[_0x4105('0x3a')]={'uniforms':{'transitionFrom':{'type':'t','value':null},'transitionTo':{'type':'t','value':null},'u1':{'type':'f','value':0x0},'u2':{'type':'f','value':0x0},'u3':{'type':'f','value':0x1}},'vertexShader':[_0x4105('0x1'),_0x4105('0x2'),_0x4105('0x3'),_0x4105('0x3b'),'}'][_0x4105('0x4')]('\x0a'),'fragmentShader':[_0x4105('0x30'),_0x4105('0x5'),_0x4105('0x1'),_0x4105('0x6'),_0x4105('0x7'),_0x4105('0x8'),_0x4105('0x3c'),_0x4105('0x19'),_0x4105('0x3d'),'if(u1\x20>\x200.){',_0x4105('0x3e'),_0x4105('0x3f'),'uv.x\x20=\x201.\x20-\x20uv.x;','}else\x20if(u1\x20<\x200.){',_0x4105('0x40'),'uv.x\x20=\x20pow(uv.x\x20*\x20(pow(sx,sx*(-sx))),\x201.\x20/\x20-sx);','}',_0x4105('0x41'),_0x4105('0x42'),_0x4105('0x43'),_0x4105('0x44'),_0x4105('0x45'),_0x4105('0x46'),_0x4105('0x47'),_0x4105('0x48'),'}',_0x4105('0x49'),'}'][_0x4105('0x4')]('\x0a')};THREE[_0x4105('0x4a')]={'uniforms':{'transitionFrom':{'type':'t','value':null},'transitionTo':{'type':'t','value':null},'u3':{'type':'f','value':0x0},'u4':{'type':'f','value':0x0},'u5':{'type':'f','value':0x0},'u6':{'type':'f','value':0x0},'u7':{'type':'f','value':0x1}},'vertexShader':[_0x4105('0x1'),_0x4105('0x2'),'vUv\x20=\x20uv;',_0x4105('0x3b'),'}'][_0x4105('0x4')]('\x0a'),'fragmentShader':[_0x4105('0x30'),_0x4105('0x5'),_0x4105('0x1'),_0x4105('0x8'),_0x4105('0x9'),_0x4105('0xa'),_0x4105('0xb'),_0x4105('0x4b'),_0x4105('0x15'),_0x4105('0x16'),_0x4105('0x17'),'return\x20a;','}',_0x4105('0x2'),_0x4105('0x19'),'vec4\x20l2\x20=\x20vec4(0.0,0.0,0.0,0.0);',_0x4105('0x1b'),_0x4105('0x1c'),_0x4105('0x4c'),_0x4105('0x25'),_0x4105('0x4d'),_0x4105('0x27'),_0x4105('0x28'),_0x4105('0x29'),_0x4105('0x2a'),'}','gl_FragColor\x20=\x20(l2/float(12))\x20*\x20u7;',_0x4105('0x2c'),_0x4105('0x2d'),_0x4105('0x2e'),'}','}'][_0x4105('0x4')]('\x0a')};THREE[_0x4105('0x4e')]={'uniforms':{'transitionFrom':{'type':'t','value':null},'transitionTo':{'type':'t','value':null},'u1':{'type':'f','value':0x1},'u2':{'type':'f','value':0x0},'u3':{'type':'f','value':0x1},'u4':{'type':'f','value':0x0}},'vertexShader':['varying\x20vec2\x20vUv;',_0x4105('0x2'),_0x4105('0x3'),_0x4105('0x3b'),'}']['join']('\x0a'),'fragmentShader':[_0x4105('0x30'),'uniform\x20sampler2D\x20transitionTo;',_0x4105('0x1'),_0x4105('0x6'),_0x4105('0x7'),_0x4105('0x8'),_0x4105('0x9'),_0x4105('0x4f'),_0x4105('0x50'),'float\x20r\x20=\x20sqrt(dot(d,\x20d));','float\x20power\x20=\x20(\x202.0\x20*\x203.141592\x20/\x20(2.0\x20*\x20sqrt(dot(c,\x20c)))\x20)\x20*\x20f;',_0x4105('0x10'),_0x4105('0x11'),'uv\x20=\x20c\x20+\x20normalize(d)\x20*\x20tan(r\x20*\x20power)\x20*\x20bind\x20/\x20tan(\x20bind\x20*\x20power);',_0x4105('0x51'),_0x4105('0x13'),_0x4105('0x14'),'}',_0x4105('0x15'),_0x4105('0x16'),_0x4105('0x17'),_0x4105('0x18'),'}',_0x4105('0x2'),_0x4105('0x19'),_0x4105('0x1a'),_0x4105('0x52'),_0x4105('0x53'),'uv=fe(uv,\x20l3,\x20u4);',_0x4105('0x31'),'vec2\x20l5\x20=\x20vec2(1./l4,1./l4);',_0x4105('0x21'),'vec2\x20l6\x20=\x20u2*(l3\x20-\x20uv);',_0x4105('0x25'),'for\x20(int\x20i\x20=\x200;\x20i\x20<\x2012;\x20i\x20+=\x201)\x20','{','uv3\x20=\x20uv+float(i)/float(12)*l6;','uv3\x20=\x20uv3\x20*\x20l5\x20-\x20l3\x20*\x20l5\x20+\x20l3;',_0x4105('0x36'),_0x4105('0x2a'),'}',_0x4105('0x37'),_0x4105('0x2c'),_0x4105('0x38'),_0x4105('0x54'),_0x4105('0x39'),'}','}'][_0x4105('0x4')]('\x0a')};THREE[_0x4105('0x55')]={'uniforms':{'transitionFrom':{'type':'t','value':null},'transitionTo':{'type':'t','value':null},'u1':{'type':'f','value':0x1}},'vertexShader':[_0x4105('0x1'),_0x4105('0x2'),_0x4105('0x3'),'gl_Position\x20=\x20projectionMatrix\x20*\x20modelViewMatrix\x20*\x20vec4(\x20position,\x201.0\x20);','}'][_0x4105('0x4')]('\x0a'),'fragmentShader':[_0x4105('0x30'),'uniform\x20sampler2D\x20transitionTo;','uniform\x20float\x20u1;',_0x4105('0x1'),'void\x20main(\x20)','{',_0x4105('0x56'),'}'][_0x4105('0x4')]('\x0a')};THREE[_0x4105('0x57')]=function(_0x1fdcad){this[_0x4105('0x58')]=document[_0x4105('0x59')](_0x4105('0x58'));this['video'][_0x4105('0x5a')]=_0x1fdcad['width'];this[_0x4105('0x58')][_0x4105('0x5b')]=_0x1fdcad[_0x4105('0x5b')];this[_0x4105('0x58')][_0x4105('0x5c')]=![];this[_0x4105('0x58')]['loop']=!![];this[_0x4105('0x58')][_0x4105('0x5d')]=!![];this[_0x4105('0x58')][_0x4105('0x5e')](_0x4105('0x5f'),'');this['video'][_0x4105('0x5e')]('src',_0x1fdcad[_0x4105('0x60')]);this[_0x4105('0x58')]['setAttribute']('crossOrigin',_0x4105('0x61'));this[_0x4105('0x58')][_0x4105('0x62')]=_0x4105('0x63');this['video'][_0x4105('0x64')]();this[_0x4105('0x65')]=new THREE[(_0x4105('0x66'))](this[_0x4105('0x58')]);};THREE[_0x4105('0x67')]=function(_0x226d7a,_0x3eef0a){var _0x592cc6=this;_0x592cc6['ev']=_0x3eef0a;_0x592cc6[_0x4105('0x68')]=_0x226d7a;_0x592cc6[_0x4105('0x69')]={};};Object['assign'](THREE[_0x4105('0x67')]['prototype'],{'addEffect':function(_0x39f53c){var _0x248cda=this;function _0x592b27(_0x3ee96a){return _0x3ee96a[_0x4105('0x6a')](0x0)['toUpperCase']()+_0x3ee96a[_0x4105('0x6b')](0x1);}if(!_0x248cda[_0x4105('0x69')]['hasOwnProperty'](_0x39f53c[_0x4105('0x6c')])){var _0x1e238a=_0x39f53c[_0x4105('0x6c')];if(_0x1e238a===_0x4105('0x6d')){_0x1e238a=_0x4105('0x6e');_0x39f53c[_0x4105('0x6e')]=_0x39f53c[_0x4105('0x6e')]||0xa;}if(_0x1e238a===_0x4105('0x6f')){_0x1e238a=_0x4105('0x6e');_0x39f53c[_0x4105('0x6e')]=_0x39f53c[_0x4105('0x6e')]||0x0;}var _0x2eaec9=_0x1e238a+_0x4105('0x70');var _0x5e0a98=[_0x4105('0x71'),_0x4105('0x72'),_0x4105('0x73'),_0x4105('0x74'),_0x4105('0x75'),_0x4105('0x6e')];_0x5e0a98[_0x4105('0x76')](function(_0x1e1d6e){if(_0x1e238a[_0x4105('0x77')](_0x1e1d6e)===0x0)_0x2eaec9=_0x592b27(_0x1e1d6e)+_0x4105('0x70');});_0x248cda[_0x4105('0x69')][_0x2eaec9]=new THREE[_0x2eaec9](_0x39f53c[_0x4105('0x78')],_0x39f53c['sliderTextureTo'],_0x248cda['ev']);}_0x248cda['currentEffect']=_0x248cda['effects'][_0x2eaec9];_0x248cda[_0x4105('0x79')][_0x4105('0x7a')](_0x39f53c[_0x4105('0x78')]);_0x248cda[_0x4105('0x79')][_0x4105('0x7b')]=_0x39f53c[_0x4105('0x7c')]===undefined;},'render':function(){var _0x18f5c9=this;if(_0x18f5c9[_0x4105('0x79')][_0x4105('0x7b')]===!![])_0x18f5c9[_0x4105('0x79')][_0x4105('0x7d')](_0x18f5c9[_0x4105('0x68')]);},'animate':function(_0x63ae21,_0x5c06df){var _0x1a4433=this;_0x1a4433['currentEffect']['animate'](_0x63ae21,_0x5c06df);_0x1a4433['currentEffect'][_0x4105('0x7b')]=!![];_0x1a4433[_0x4105('0x7d')]();},'resetEffectHandler':function(){var _0x986ee2=this;_0x986ee2[_0x4105('0x69')]={};}});THREE[_0x4105('0x70')]=function(_0xe00ff0){var _0x2889c0=this;_0x2889c0['ev']=_0xe00ff0;_0x2889c0[_0x4105('0x7b')]=!![];};Object[_0x4105('0x7e')](THREE[_0x4105('0x70')][_0x4105('0x7f')],{'render':function(){console['error'](_0x4105('0x80'));},'animate':function(){console[_0x4105('0x81')](_0x4105('0x82'));},'animationComplete':function(_0x55f407){var _0xb5d864=this;_0xb5d864['ev'][_0x4105('0x83')]('animationComplete',[_0x55f407]);_0xb5d864['ev'][_0x4105('0x83')](_0x4105('0x84'));},'getEasingFunction':function(_0x335df3){switch(_0x335df3){case'easeInSine':return TWEEN[_0x4105('0x85')][_0x4105('0x86')]['In'];case _0x4105('0x87'):return TWEEN[_0x4105('0x85')][_0x4105('0x86')][_0x4105('0x88')];case'easeOutSine':return TWEEN[_0x4105('0x85')][_0x4105('0x86')][_0x4105('0x89')];case _0x4105('0x8a'):return TWEEN[_0x4105('0x85')][_0x4105('0x8b')]['In'];case _0x4105('0x8c'):return TWEEN[_0x4105('0x85')][_0x4105('0x8b')][_0x4105('0x88')];case _0x4105('0x8d'):return TWEEN[_0x4105('0x85')][_0x4105('0x8b')][_0x4105('0x89')];case _0x4105('0x8e'):return TWEEN['Easing'][_0x4105('0x8f')]['In'];case _0x4105('0x90'):return TWEEN['Easing'][_0x4105('0x8f')][_0x4105('0x88')];case _0x4105('0x91'):return TWEEN[_0x4105('0x85')][_0x4105('0x8f')][_0x4105('0x89')];case _0x4105('0x92'):return TWEEN[_0x4105('0x85')][_0x4105('0x93')]['In'];case _0x4105('0x94'):return TWEEN[_0x4105('0x85')]['Quintic']['Out'];case _0x4105('0x95'):return TWEEN[_0x4105('0x85')]['Exponential']['In'];case _0x4105('0x96'):return TWEEN[_0x4105('0x85')][_0x4105('0x97')][_0x4105('0x89')];case'easeInBack':return TWEEN[_0x4105('0x85')]['Back']['In'];case _0x4105('0x98'):return TWEEN[_0x4105('0x85')]['Back'][_0x4105('0x89')];case _0x4105('0x99'):return TWEEN[_0x4105('0x85')][_0x4105('0x9a')]['In'];case _0x4105('0x9b'):return TWEEN[_0x4105('0x85')][_0x4105('0x9a')]['Out'];case _0x4105('0x9c'):return TWEEN[_0x4105('0x85')][_0x4105('0x9d')][_0x4105('0x9e')];}}});THREE[_0x4105('0x9f')]=function(_0x3454c4,_0x15dacd,_0x3b79e2){THREE[_0x4105('0x70')]['call'](this,_0x3b79e2);if(THREE[_0x4105('0x4e')]===undefined)console[_0x4105('0x81')](_0x4105('0xa0'));var _0x19f553=THREE['PowerZoomShader'];this['uniforms']=THREE[_0x4105('0xa1')][_0x4105('0xa2')](_0x19f553[_0x4105('0xa3')]);this[_0x4105('0xa4')]={'u1':0x1,'u2':0x0,'u3':0x1,'u4':0x0};this[_0x4105('0xa5')]={'u1':0x1,'u2':0x0,'u3':0x1,'u4':0x0,'t1':0x3b6,'t2':0x32,'easing1':TWEEN[_0x4105('0x85')][_0x4105('0x93')]['In'],'easing2':TWEEN[_0x4105('0x85')][_0x4105('0x93')][_0x4105('0x89')]};this[_0x4105('0xa6')]=['in',_0x4105('0xa7')];if(_0x3454c4!==undefined)this[_0x4105('0xa3')][_0x4105('0xa8')]['value']=_0x3454c4;this[_0x4105('0xa9')]=new THREE[(_0x4105('0xaa'))]({'uniforms':this['uniforms'],'vertexShader':_0x19f553[_0x4105('0xab')],'fragmentShader':_0x19f553[_0x4105('0xac')]});};THREE[_0x4105('0x9f')][_0x4105('0x7f')]=Object[_0x4105('0x7e')](Object['create'](THREE['Effect'][_0x4105('0x7f')]),{'constructor':THREE[_0x4105('0x9f')],'render':function(_0x40c059){_0x40c059[_0x4105('0xa9')]=this[_0x4105('0xa9')];for(var _0x33fdc6 in this[_0x4105('0xa4')]){this[_0x4105('0xa3')][_0x33fdc6][_0x4105('0xad')]=this['transform'][_0x33fdc6];}TWEEN[_0x4105('0xae')]();},'resetEffect':function(_0x414d3f){this[_0x4105('0xa3')]['transitionFrom']['value']=_0x414d3f;},'animate':function(_0x322e0e,_0x35371f){this[_0x4105('0xaf')]=_0x322e0e;this['defaults']['t1']=0.3*_0x322e0e[_0x4105('0xb0')];this[_0x4105('0xa5')]['t2']=0.7*_0x322e0e[_0x4105('0xb0')];this[_0x4105('0xa3')]['transitionFrom'][_0x4105('0xad')]=_0x322e0e[_0x4105('0x78')];this[_0x4105('0xb1')]=_0x322e0e[_0x4105('0x7c')];this['pauseVideoCallback']=_0x35371f;var _0x271ea2=_0x322e0e[_0x4105('0xb2')]>_0x322e0e[_0x4105('0xb3')];var _0x7c5410=_0x322e0e[_0x4105('0x6c')][_0x4105('0xb4')]();var _0x4c2edc=0x8;var _0x2b8066=0x1;this[_0x4105('0xa6')][_0x4105('0x76')](function(_0x5f0882){if(_0x7c5410[_0x4105('0x77')](_0x5f0882)!==-0x1)_0x322e0e['direction']=_0x5f0882;});if(_0x7c5410[_0x4105('0x77')](_0x4105('0xb5'))!==-0x1||_0x322e0e[_0x4105('0xb6')]===_0x4105('0xb5'))_0x4c2edc=0xa;if(_0x7c5410[_0x4105('0x77')](_0x4105('0xb7'))!==-0x1||_0x322e0e['distance']===_0x4105('0xb7'))_0x4c2edc=0x6;if(_0x7c5410[_0x4105('0x77')](_0x4105('0x6d'))!==-0x1||_0x322e0e[_0x4105('0x6e')]===_0x4105('0x6d'))_0x2b8066=0xa;if(_0x7c5410[_0x4105('0x77')]('fade')!==-0x1||_0x322e0e[_0x4105('0x6e')]===_0x4105('0x6f'))_0x2b8066=0x0;if(!_0x322e0e['direction']){var _0x422763=STX[_0x4105('0xb8')][_0x4105('0xb9')](0x0,0x3);_0x322e0e[_0x4105('0xba')]=this[_0x4105('0xa6')][_0x422763];}if(typeof _0x322e0e[_0x4105('0xb6')]==_0x4105('0xbb'))_0x4c2edc=_0x322e0e[_0x4105('0xb6')];if(typeof _0x322e0e['brightness']==_0x4105('0xbb'))_0x2b8066=_0x322e0e[_0x4105('0x6e')];var _0xee5bde=_0x4105('0x8f');var _0x37a29a=_0x4105('0x8f');if(_0x7c5410['indexOf'](_0x4105('0xbc'))!==-0x1||_0x322e0e[_0x4105('0xbd')]===_0x4105('0xbc')){_0xee5bde=_0x4105('0x86');_0x37a29a='Sinusoidal';}if(_0x7c5410[_0x4105('0x77')]('elastic')!==-0x1||_0x322e0e[_0x4105('0xbd')]===_0x4105('0xbe')){_0xee5bde=_0x4105('0x8f');_0x37a29a=_0x4105('0xbf');}if(_0x322e0e[_0x4105('0xba')]==='out')_0x4c2edc=0x1/_0x4c2edc;if(_0x271ea2)_0x4c2edc=0x1/_0x4c2edc;this[_0x4105('0x73')](_0x4c2edc,TWEEN[_0x4105('0x85')][_0xee5bde]['In'],TWEEN[_0x4105('0x85')][_0x37a29a][_0x4105('0x89')],_0x2b8066);},'zoom':function(_0x21af55,_0x39b862,_0x47a548,_0x14f65c){var _0x249373={'u1':_0x21af55,'u2':0.2,'u3':_0x14f65c,'u4':-0.2,'u5':0x1/_0x21af55,'easing1':_0x39b862,'easing2':_0x47a548};this[_0x4105('0xc0')](_0x249373);},'tween':function(_0x4c39ca){for(var _0xf09872 in this[_0x4105('0xa5')]){if(typeof _0x4c39ca[_0xf09872]=='undefined')_0x4c39ca[_0xf09872]=this[_0x4105('0xa5')][_0xf09872];}var _0x336ee5=this;var _0x9f38de={'u1':0x1,'u2':0x0,'u3':0x1,'u4':0x0};var _0x1dff9d=new TWEEN[(_0x4105('0xc1'))](_0x9f38de)['to']({'u1':_0x4c39ca['u1'],'u2':_0x4c39ca['u2'],'u3':_0x4c39ca['u3'],'u4':_0x4c39ca['u4']},_0x4c39ca['t1'])[_0x4105('0xbd')](_0x4c39ca[_0x4105('0xc2')])[_0x4105('0xc3')](function(){for(var _0xf09872 in _0x9f38de){_0x336ee5[_0x4105('0xa4')][_0xf09872]=_0x9f38de[_0xf09872];}})[_0x4105('0xc4')](function(){_0x336ee5[_0x4105('0xc5')]();})[_0x4105('0xc6')]();var _0x5ed7bf={'u1':_0x4c39ca['u5'],'u2':_0x4c39ca['u2'],'u3':_0x4c39ca['u3'],'u4':_0x4c39ca['u4']};var _0xc22a6b=new TWEEN[(_0x4105('0xc1'))](_0x5ed7bf)['to']({'u1':0x1,'u2':0x0,'u3':0x1,'u4':0x0},_0x4c39ca['t2'])['delay'](_0x4c39ca['t1'])[_0x4105('0xbd')](_0x4c39ca['easing2'])[_0x4105('0xc3')](function(){for(var _0xf09872 in _0x5ed7bf){_0x336ee5[_0x4105('0xa4')][_0xf09872]=_0x5ed7bf[_0xf09872];}})[_0x4105('0xc4')](function(){_0x336ee5[_0x4105('0xc7')]();})[_0x4105('0xc6')]();},'switchTexture':function(){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=this[_0x4105('0xb1')];this[_0x4105('0xc8')]();}});THREE[_0x4105('0xc9')]=function(_0x3a6607,_0x926597,_0x2a4282){THREE[_0x4105('0x70')][_0x4105('0xca')](this,_0x2a4282);if(THREE[_0x4105('0x4a')]===undefined)console['error'](_0x4105('0xcb'));var _0x4eabf8=THREE[_0x4105('0x4a')];this[_0x4105('0xa3')]=THREE[_0x4105('0xa1')][_0x4105('0xa2')](_0x4eabf8[_0x4105('0xa3')]);this[_0x4105('0xa4')]={'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1};this['defaults']={'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1,'t1':0x12c,'t2':0x2bc,'easing1':TWEEN[_0x4105('0x85')][_0x4105('0x93')]['In'],'easing2':TWEEN['Easing'][_0x4105('0x93')][_0x4105('0x89')]};this[_0x4105('0xa6')]=[_0x4105('0xcc'),_0x4105('0xcd'),_0x4105('0xce'),_0x4105('0xcf'),_0x4105('0xd0'),_0x4105('0xd1'),_0x4105('0xd2'),_0x4105('0xd3')];if(_0x3a6607!==undefined)this['uniforms']['transitionFrom']['value']=_0x3a6607;this[_0x4105('0xa9')]=new THREE['ShaderMaterial']({'uniforms':this['uniforms'],'vertexShader':_0x4eabf8[_0x4105('0xab')],'fragmentShader':_0x4eabf8['fragmentShader']});};THREE['RollEffect'][_0x4105('0x7f')]=Object[_0x4105('0x7e')](Object['create'](THREE[_0x4105('0x70')][_0x4105('0x7f')]),{'constructor':THREE[_0x4105('0xc9')],'render':function(_0x4a3ef1){_0x4a3ef1[_0x4105('0xa9')]=this['material'];for(var _0x25220 in this[_0x4105('0xa4')]){this[_0x4105('0xa3')][_0x25220][_0x4105('0xad')]=this[_0x4105('0xa4')][_0x25220];}TWEEN[_0x4105('0xae')]();},'resetEffect':function(_0x68989a){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=_0x68989a;},'animate':function(_0x8ed229,_0x4e79b3){this[_0x4105('0xaf')]=_0x8ed229;this['defaults']['t1']=0.3*_0x8ed229[_0x4105('0xb0')];this[_0x4105('0xa5')]['t1']=0.7*_0x8ed229[_0x4105('0xb0')];this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=_0x8ed229[_0x4105('0x78')];this[_0x4105('0xb1')]=_0x8ed229[_0x4105('0x7c')];this[_0x4105('0xc8')]=_0x4e79b3;var _0x1a6d8a=_0x8ed229['slideFrom']>_0x8ed229[_0x4105('0xb3')];var _0x43138d=_0x8ed229[_0x4105('0x6c')][_0x4105('0xb4')]();var _0x2cc4b2=1.5,_0x1e325c=0x1,_0x22f2e7=0x0,_0x128259=0x0;this[_0x4105('0xa6')]['forEach'](function(_0x20c39f){if(_0x43138d[_0x4105('0x77')](_0x20c39f)!==-0x1)_0x8ed229[_0x4105('0xba')]=_0x20c39f;});if(_0x43138d[_0x4105('0x77')](_0x4105('0xb5'))!==-0x1||_0x8ed229['distance']===_0x4105('0xb5'))_0x2cc4b2=2.5;if(_0x43138d[_0x4105('0x77')](_0x4105('0xb7'))!==-0x1||_0x8ed229[_0x4105('0xb6')]===_0x4105('0xb7'))_0x2cc4b2=0x1;if(_0x43138d['indexOf'](_0x4105('0x6d'))!==-0x1||_0x8ed229[_0x4105('0x6e')]===_0x4105('0x6d'))_0x1e325c=0xa;if(_0x43138d['indexOf'](_0x4105('0x6f'))!==-0x1||_0x8ed229[_0x4105('0x6e')]===_0x4105('0x6f'))_0x1e325c=0x0;if(_0x8ed229[_0x4105('0xba')]){_0x8ed229[_0x4105('0xba')]=_0x8ed229[_0x4105('0xba')][_0x4105('0xd4')]('up',_0x4105('0xcc'))[_0x4105('0xd4')](_0x4105('0xd5'),_0x4105('0xcd'));}else{var _0x4a5d95=STX[_0x4105('0xb8')][_0x4105('0xb9')](0x0,0x7);_0x8ed229[_0x4105('0xba')]=this[_0x4105('0xa6')][_0x4a5d95];}var _0xcdefcc=_0x8ed229[_0x4105('0xba')][_0x4105('0xb4')]();if(_0xcdefcc[_0x4105('0x77')](_0x4105('0xcc'))!==-0x1)_0x128259=0x1;if(_0xcdefcc[_0x4105('0x77')](_0x4105('0xcd'))!==-0x1)_0x128259=-0x1;if(_0xcdefcc[_0x4105('0x77')]('left')!==-0x1)_0x22f2e7=-0x1;if(_0xcdefcc['indexOf'](_0x4105('0xcf'))!==-0x1)_0x22f2e7=0x1;if(typeof _0x8ed229['distance']==_0x4105('0xbb'))_0x2cc4b2=_0x8ed229[_0x4105('0xb6')];if(typeof _0x8ed229['brightness']==_0x4105('0xbb'))_0x1e325c=_0x8ed229[_0x4105('0x6e')];var _0x24ecd6='Quintic';var _0xccf14e=_0x4105('0x93');if(_0x43138d[_0x4105('0x77')](_0x4105('0xbc'))!==-0x1||_0x8ed229[_0x4105('0xbd')]===_0x4105('0xbc')){_0x24ecd6=_0x4105('0x86');_0xccf14e=_0x4105('0x8f');}if(_0x43138d[_0x4105('0x77')]('elastic')!==-0x1||_0x8ed229[_0x4105('0xbd')]===_0x4105('0xbe')){_0x24ecd6=_0x4105('0xd6');_0xccf14e=_0x4105('0xbf');}_0x22f2e7*=_0x2cc4b2;_0x128259*=_0x2cc4b2;if(_0x1a6d8a){_0x22f2e7*=-0x1;_0x128259*=-0x1;}this['roll'](_0x22f2e7,_0x128259,TWEEN[_0x4105('0x85')][_0x24ecd6]['In'],TWEEN['Easing'][_0xccf14e]['Out'],_0x1e325c);},'roll':function(_0x1d6bf6,_0xfeebd3,_0x4e15b8,_0x4888e6,_0x4a70c2){var _0x29df6e={'u5':_0x1d6bf6,'u6':_0xfeebd3,'u7':_0x4a70c2,'easing1':_0x4e15b8,'easing2':_0x4888e6};this['tween'](_0x29df6e);},'tween':function(_0x36a479){_0x36a479['u3']=0.05*-Math[_0x4105('0xd7')](_0x36a479['u5']);_0x36a479['u4']=0.05*-Math['sign'](_0x36a479['u6']);for(var _0x3feb42 in this[_0x4105('0xa5')]){if(typeof _0x36a479[_0x3feb42]==_0x4105('0xd8'))_0x36a479[_0x3feb42]=this[_0x4105('0xa5')][_0x3feb42];}var _0x171fd0=this;var _0x194bbf={'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1};var _0x3e8146=new TWEEN['Tween'](_0x194bbf)['to']({'u3':_0x36a479['u3'],'u4':_0x36a479['u4'],'u5':_0x36a479['u5'],'u6':_0x36a479['u6'],'u7':_0x36a479['u7']},_0x36a479['t1'])['easing'](_0x36a479['easing1'])[_0x4105('0xc3')](function(){for(var _0x3feb42 in _0x194bbf){_0x171fd0[_0x4105('0xa4')][_0x3feb42]=_0x194bbf[_0x3feb42];}})[_0x4105('0xc4')](function(){_0x171fd0[_0x4105('0xc5')]();})[_0x4105('0xc6')]();var _0x3d5ad2={'u3':_0x36a479['u3'],'u4':_0x36a479['u4'],'u5':-_0x36a479['u5'],'u6':-_0x36a479['u6'],'u7':_0x36a479['u7']};var _0x3eaa46=new TWEEN[(_0x4105('0xc1'))](_0x3d5ad2)['to']({'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1},_0x36a479['t2'])[_0x4105('0xd9')](_0x36a479['t1'])[_0x4105('0xbd')](_0x36a479[_0x4105('0xda')])[_0x4105('0xc3')](function(){for(var _0x3feb42 in _0x3d5ad2){_0x171fd0[_0x4105('0xa4')][_0x3feb42]=_0x3d5ad2[_0x3feb42];}})[_0x4105('0xc4')](function(){_0x171fd0[_0x4105('0xc7')]();})[_0x4105('0xc6')]();},'switchTexture':function(){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=this[_0x4105('0xb1')];this[_0x4105('0xc8')]();}});THREE[_0x4105('0xdb')]=function(_0x142296,_0x11204d,_0x375353){THREE[_0x4105('0x70')][_0x4105('0xca')](this,_0x375353);if(THREE[_0x4105('0x3a')]===undefined)console['error']('THREE.StretchEffect\x20relies\x20on\x20THREE.StretchShader');var _0x35163b=THREE[_0x4105('0x3a')];this['uniforms']=THREE[_0x4105('0xa1')]['clone'](_0x35163b['uniforms']);this[_0x4105('0xa4')]={'u1':0x0,'u2':0x0,'u3':0x1};this[_0x4105('0xa5')]={'u1':0x0,'u2':0x0,'t1':0x190,'t2':0x258,'easing1':TWEEN['Easing'][_0x4105('0x86')]['In'],'easing2':TWEEN[_0x4105('0x85')][_0x4105('0x86')][_0x4105('0x89')]};this[_0x4105('0xa6')]=[_0x4105('0xcc'),'bottom',_0x4105('0xce'),_0x4105('0xcf')];if(_0x142296!==undefined)this[_0x4105('0xa3')]['transitionFrom'][_0x4105('0xad')]=_0x142296;this[_0x4105('0xa9')]=new THREE[(_0x4105('0xaa'))]({'uniforms':this[_0x4105('0xa3')],'vertexShader':_0x35163b[_0x4105('0xab')],'fragmentShader':_0x35163b[_0x4105('0xac')]});};THREE[_0x4105('0xdb')][_0x4105('0x7f')]=Object['assign'](Object[_0x4105('0xdc')](THREE[_0x4105('0x70')][_0x4105('0x7f')]),{'constructor':THREE[_0x4105('0xdb')],'render':function(_0x2f9b13){_0x2f9b13['material']=this[_0x4105('0xa9')];for(var _0x4d44b7 in this[_0x4105('0xa4')]){this[_0x4105('0xa3')][_0x4d44b7][_0x4105('0xad')]=this['transform'][_0x4d44b7];}TWEEN['update']();},'resetEffect':function(_0x5e9ce9){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=_0x5e9ce9;},'animate':function(_0x59f837,_0x3d95be){this['options']=_0x59f837;this['defaults']['t1']=0.4*_0x59f837[_0x4105('0xb0')];this[_0x4105('0xa5')]['t2']=0.6*_0x59f837['transitionDuration'];this['uniforms'][_0x4105('0xa8')][_0x4105('0xad')]=_0x59f837[_0x4105('0x78')];this[_0x4105('0xb1')]=_0x59f837['sliderTextureTo'];this[_0x4105('0xc8')]=_0x3d95be;var _0x3e83a2=_0x59f837[_0x4105('0xb2')]>_0x59f837['slideTo'];var _0x5bf29c=_0x59f837[_0x4105('0x6c')][_0x4105('0xb4')]();var _0x3ed033=2.5,_0x28b0d9=0x1,_0x4f6bf2=0x0,_0x53bf44=0x0;this[_0x4105('0xa6')][_0x4105('0x76')](function(_0x5f051d){if(_0x5bf29c[_0x4105('0x77')](_0x5f051d)!==-0x1)_0x59f837[_0x4105('0xba')]=_0x5f051d;});if(_0x5bf29c[_0x4105('0x77')](_0x4105('0xb5'))!==-0x1||_0x59f837[_0x4105('0xb6')]==='long')_0x3ed033=0x4;if(_0x5bf29c[_0x4105('0x77')](_0x4105('0xb7'))!==-0x1||_0x59f837[_0x4105('0xb6')]===_0x4105('0xb7'))_0x3ed033=1.5;if(_0x5bf29c[_0x4105('0x77')](_0x4105('0x6d'))!==-0x1||_0x59f837[_0x4105('0x6e')]===_0x4105('0x6d'))_0x28b0d9=0xa;if(_0x5bf29c[_0x4105('0x77')]('fade')!==-0x1||_0x59f837['brightness']===_0x4105('0x6f'))_0x28b0d9=0x0;if(_0x59f837[_0x4105('0xba')]){_0x59f837[_0x4105('0xba')]=_0x59f837[_0x4105('0xba')]['replace']('up',_0x4105('0xcc'))[_0x4105('0xd4')](_0x4105('0xd5'),'bottom');}else{var _0x53e0d1=STX[_0x4105('0xb8')][_0x4105('0xb9')](0x0,0x3);_0x59f837[_0x4105('0xba')]=this[_0x4105('0xa6')][_0x53e0d1];}if(_0x59f837[_0x4105('0xba')]===_0x4105('0xcc'))_0x53bf44=0x1;if(_0x59f837[_0x4105('0xba')]===_0x4105('0xcd'))_0x53bf44=-0x1;if(_0x59f837[_0x4105('0xba')]===_0x4105('0xce'))_0x4f6bf2=-0x1;if(_0x59f837[_0x4105('0xba')]===_0x4105('0xcf'))_0x4f6bf2=0x1;if(typeof _0x59f837[_0x4105('0xb6')]==_0x4105('0xbb'))_0x3ed033=_0x59f837[_0x4105('0xb6')];if(typeof _0x59f837[_0x4105('0x6e')]==_0x4105('0xbb'))_0x28b0d9=_0x59f837['brightness'];var _0x19ff9a=_0x4105('0x8f');var _0x10df19=_0x4105('0x8f');if(_0x5bf29c[_0x4105('0x77')](_0x4105('0xbc'))!==-0x1||_0x59f837[_0x4105('0xbd')]===_0x4105('0xbc')){_0x19ff9a='Sinusoidal';_0x10df19=_0x4105('0x86');}if(_0x5bf29c[_0x4105('0x77')](_0x4105('0xbe'))!==-0x1||_0x59f837[_0x4105('0xbd')]===_0x4105('0xbe')){_0x19ff9a=_0x4105('0x86');_0x10df19=_0x4105('0xbf');}_0x4f6bf2*=_0x3ed033;_0x53bf44*=_0x3ed033;if(_0x3e83a2){_0x4f6bf2*=-0x1;_0x53bf44*=-0x1;}this[_0x4105('0x72')](_0x4f6bf2,_0x53bf44,TWEEN[_0x4105('0x85')][_0x19ff9a]['In'],TWEEN[_0x4105('0x85')][_0x10df19][_0x4105('0x89')],_0x28b0d9);},'stretch':function(_0x2b2233,_0x31a1ea,_0x505cc9,_0x4ad6fc,_0x487301){var _0x55a1d2={'u1':_0x2b2233,'u2':_0x31a1ea,'u3':_0x487301,'easing1':_0x505cc9,'easing2':_0x4ad6fc};this[_0x4105('0xc0')](_0x55a1d2);},'tween':function(_0x34b339){for(var _0x3cafa3 in this['defaults']){if(typeof _0x34b339[_0x3cafa3]==_0x4105('0xd8'))_0x34b339[_0x3cafa3]=this[_0x4105('0xa5')][_0x3cafa3];}var _0x132617=this;var _0x4644ce={'u1':0x0,'u2':0x0,'u3':0x1};var _0x270495=new TWEEN[(_0x4105('0xc1'))](_0x4644ce)['to']({'u1':_0x34b339['u1'],'u2':_0x34b339['u2'],'u3':_0x34b339['u3']},_0x34b339['t1'])[_0x4105('0xbd')](_0x34b339[_0x4105('0xc2')])['onUpdate'](function(){for(var _0x3cafa3 in _0x4644ce){_0x132617[_0x4105('0xa4')][_0x3cafa3]=_0x4644ce[_0x3cafa3];}})[_0x4105('0xc4')](function(){_0x132617[_0x4105('0xc5')]();})[_0x4105('0xc6')]();var _0x13567a={'u1':-_0x34b339['u1'],'u2':-_0x34b339['u2'],'u3':_0x34b339['u3']};var _0x5f5588=new TWEEN[(_0x4105('0xc1'))](_0x13567a)['to']({'u1':0x0,'u2':0x0,'u3':0x1},_0x34b339['t2'])['delay'](_0x34b339['t1'])[_0x4105('0xbd')](_0x34b339[_0x4105('0xda')])[_0x4105('0xc3')](function(){for(var _0x3cafa3 in _0x13567a){_0x132617[_0x4105('0xa4')][_0x3cafa3]=_0x13567a[_0x3cafa3];}})[_0x4105('0xc4')](function(){_0x132617[_0x4105('0xc7')]();})['start']();},'switchTexture':function(){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=this['transitionTo'];this[_0x4105('0xc8')]();}});THREE[_0x4105('0xdd')]=function(_0x46c2ef,_0x570653,_0x1f9c77){THREE[_0x4105('0x70')][_0x4105('0xca')](this,_0x1f9c77);if(THREE[_0x4105('0x0')]===undefined)console[_0x4105('0x81')](_0x4105('0xde'));var _0x446ee2=THREE[_0x4105('0x0')];this[_0x4105('0xa3')]=THREE[_0x4105('0xa1')][_0x4105('0xa2')](_0x446ee2[_0x4105('0xa3')]);this[_0x4105('0xa4')]={'u1':0x0,'u2':0x0,'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1};this[_0x4105('0xa5')]={'u1':0x0,'u2':0x0,'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1,'t1':0x190,'t2':0x3e8,'t3':0x1f4,'easing1':TWEEN[_0x4105('0x85')][_0x4105('0x93')]['In'],'easing2':TWEEN[_0x4105('0x85')]['Quintic'][_0x4105('0x89')]};this['directions']=[_0x4105('0xcc'),_0x4105('0xcd'),_0x4105('0xce'),_0x4105('0xcf')];if(_0x46c2ef!==undefined)this['uniforms']['transitionFrom'][_0x4105('0xad')]=_0x46c2ef;this['material']=new THREE[(_0x4105('0xaa'))]({'uniforms':this['uniforms'],'vertexShader':_0x446ee2[_0x4105('0xab')],'fragmentShader':_0x446ee2[_0x4105('0xac')]});};THREE['WarpEffect'][_0x4105('0x7f')]=Object[_0x4105('0x7e')](Object[_0x4105('0xdc')](THREE['Effect'][_0x4105('0x7f')]),{'constructor':THREE[_0x4105('0xdd')],'render':function(_0x545c46){_0x545c46[_0x4105('0xa9')]=this[_0x4105('0xa9')];for(var _0x5e6971 in this[_0x4105('0xa4')]){this[_0x4105('0xa3')][_0x5e6971][_0x4105('0xad')]=this['transform'][_0x5e6971];}TWEEN[_0x4105('0xae')]();},'resetEffect':function(_0x353e5b){this['uniforms'][_0x4105('0xa8')][_0x4105('0xad')]=_0x353e5b;},'animate':function(_0x387d75,_0x362f61){this[_0x4105('0xaf')]=_0x387d75;this[_0x4105('0xa5')]['t1']=0.4*_0x387d75[_0x4105('0xb0')];this[_0x4105('0xa5')]['t2']=0.1*_0x387d75[_0x4105('0xb0')];this[_0x4105('0xa5')]['t3']=0.5*_0x387d75[_0x4105('0xb0')];this[_0x4105('0xa3')]['transitionFrom'][_0x4105('0xad')]=_0x387d75[_0x4105('0x78')];this['transitionTo']=_0x387d75['sliderTextureTo'];this[_0x4105('0xc8')]=_0x362f61;var _0xcfd896=_0x387d75[_0x4105('0xb2')]>_0x387d75['slideTo'];var _0x39700d=_0x387d75['transitionEffect'][_0x4105('0xb4')]();var _0x55dabe=0x2,_0x2b42c1=0x1,_0x25fc1a=0x0,_0x457f8f=0x0;this[_0x4105('0xa6')][_0x4105('0x76')](function(_0x53975b){if(_0x39700d[_0x4105('0x77')](_0x53975b)!==-0x1)_0x387d75[_0x4105('0xba')]=_0x53975b;});if(_0x39700d['indexOf'](_0x4105('0xb5'))!==-0x1||_0x387d75[_0x4105('0xb6')]===_0x4105('0xb5'))_0x55dabe=2.5;if(_0x39700d[_0x4105('0x77')](_0x4105('0xb7'))!==-0x1||_0x387d75[_0x4105('0xb6')]==='short')_0x55dabe=1.5;if(_0x39700d['indexOf']('flash')!==-0x1||_0x387d75[_0x4105('0x6e')]===_0x4105('0x6d'))_0x2b42c1=0xa;if(_0x39700d[_0x4105('0x77')](_0x4105('0x6f'))!==-0x1||_0x387d75['brightness']===_0x4105('0x6f'))_0x2b42c1=0x0;if(_0x387d75[_0x4105('0xba')]){_0x387d75[_0x4105('0xba')]=_0x387d75['direction'][_0x4105('0xd4')]('up',_0x4105('0xcc'))[_0x4105('0xd4')]('down',_0x4105('0xcd'));}else{var _0x4ff151=STX[_0x4105('0xb8')][_0x4105('0xb9')](0x0,0x3);_0x387d75[_0x4105('0xba')]=this[_0x4105('0xa6')][_0x4ff151];}if(_0x387d75[_0x4105('0xba')]===_0x4105('0xcc'))_0x457f8f=0x1;if(_0x387d75[_0x4105('0xba')]===_0x4105('0xcd'))_0x457f8f=-0x1;if(_0x387d75[_0x4105('0xba')]===_0x4105('0xce'))_0x25fc1a=-0x1;if(_0x387d75[_0x4105('0xba')]===_0x4105('0xcf'))_0x25fc1a=0x1;if(typeof _0x387d75['distance']==_0x4105('0xbb'))_0x55dabe=_0x387d75[_0x4105('0xb6')];if(typeof _0x387d75[_0x4105('0x6e')]==_0x4105('0xbb'))_0x2b42c1=_0x387d75[_0x4105('0x6e')];var _0x1ff922='Exponential';var _0x17aea3=_0x4105('0x97');if(_0x39700d[_0x4105('0x77')](_0x4105('0xbc'))!==-0x1||_0x387d75[_0x4105('0xbd')]==='slow'){_0x1ff922='Sinusoidal';_0x17aea3=_0x4105('0x97');}if(_0x39700d[_0x4105('0x77')]('elastic')!==-0x1||_0x387d75[_0x4105('0xbd')]===_0x4105('0xbe')){_0x1ff922='Sinusoidal';_0x17aea3=_0x4105('0xbf');}_0x25fc1a*=_0x55dabe;_0x457f8f*=_0x55dabe;if(_0xcfd896){_0x25fc1a*=-0x1;_0x457f8f*=-0x1;}this[_0x4105('0x75')](_0x25fc1a,_0x457f8f,TWEEN[_0x4105('0x85')][_0x1ff922]['In'],TWEEN[_0x4105('0x85')][_0x17aea3][_0x4105('0x89')],_0x2b42c1);},'warp':function(_0x562320,_0x2b85c0,_0x47529e,_0xb82da0,_0x56049f){var _0x2c5a61={'u4':0.3,'u5':_0x562320,'u6':_0x2b85c0,'u7':_0x56049f,'easing1':_0x47529e,'easing2':_0xb82da0};this[_0x4105('0xc0')](_0x2c5a61);},'tween':function(_0x597a12){if(_0x597a12['u5']!=0x0)_0x597a12['u1']=-0.05;if(_0x597a12['u6']!=0x0)_0x597a12['u2']=-0.05;_0x597a12['u4']=0.1;for(var _0x43a422 in this[_0x4105('0xa5')]){if(typeof _0x597a12[_0x43a422]==_0x4105('0xd8'))_0x597a12[_0x43a422]=this[_0x4105('0xa5')][_0x43a422];}var _0x2cb140=this;var _0x26d639={'u1':0x0,'u2':0x0,'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1};var _0x12bed2=new TWEEN[(_0x4105('0xc1'))](_0x26d639)['to']({'u1':_0x597a12['u1'],'u2':_0x597a12['u2'],'u3':_0x597a12['u3'],'u4':_0x597a12['u4'],'u5':_0x597a12['u5'],'u6':_0x597a12['u6'],'u7':_0x597a12['u7']},_0x597a12['t1'])[_0x4105('0xbd')](_0x597a12['easing1'])[_0x4105('0xc3')](function(){for(var _0x43a422 in _0x26d639){_0x2cb140[_0x4105('0xa4')][_0x43a422]=_0x26d639[_0x43a422];}})[_0x4105('0xc4')](function(){})[_0x4105('0xc6')]();var _0x417547={'u5':_0x597a12['u5'],'u6':_0x597a12['u6']};var _0x2c3e73=new TWEEN[(_0x4105('0xc1'))](_0x417547)['to']({'u5':_0x597a12['u5']*0x2,'u6':_0x597a12['u6']*0x2},_0x597a12['t2'])['delay'](_0x597a12['t1'])[_0x4105('0xbd')](TWEEN[_0x4105('0x85')]['Linear']['None'])[_0x4105('0xc3')](function(){for(var _0x43a422 in _0x417547){_0x2cb140[_0x4105('0xa4')][_0x43a422]=_0x417547[_0x43a422];}})['onComplete'](function(){_0x2cb140['switchTexture']();})['start']();var _0x800b82={'u1':_0x597a12['u1'],'u2':_0x597a12['u2'],'u3':_0x597a12['u3'],'u4':_0x597a12['u4'],'u5':-_0x597a12['u5'],'u6':-_0x597a12['u6'],'u7':_0x597a12['u7']};var _0x5e3cd0=new TWEEN[(_0x4105('0xc1'))](_0x800b82)['to']({'u1':0x0,'u2':0x0,'u3':0x0,'u4':0x0,'u5':0x0,'u6':0x0,'u7':0x1},_0x597a12['t3'])[_0x4105('0xd9')](_0x597a12['t1']+_0x597a12['t2'])[_0x4105('0xbd')](_0x597a12[_0x4105('0xda')])[_0x4105('0xc3')](function(){for(var _0x43a422 in _0x800b82){_0x2cb140[_0x4105('0xa4')][_0x43a422]=_0x800b82[_0x43a422];}})[_0x4105('0xc4')](function(){_0x2cb140[_0x4105('0xc7')]();})[_0x4105('0xc6')]();},'switchTexture':function(){this['uniforms']['transitionFrom'][_0x4105('0xad')]=this[_0x4105('0xb1')];this[_0x4105('0xc8')]();}});THREE[_0x4105('0xdf')]=function(_0x2a7579,_0x5d1997,_0x9e0a9b){THREE['Effect']['call'](this,_0x9e0a9b);if(THREE[_0x4105('0x2f')]===undefined)console['error'](_0x4105('0xe0'));var _0x5915a7=THREE[_0x4105('0x2f')];this[_0x4105('0xa3')]=THREE[_0x4105('0xa1')][_0x4105('0xa2')](_0x5915a7[_0x4105('0xa3')]);this[_0x4105('0xa4')]={'u1':0x1,'u2':0x0,'u3':0x1};this[_0x4105('0xa5')]={'u1':0x1,'u2':0x0,'u3':0x1,'t1':0x12c,'t2':0x2bc,'easing1':TWEEN[_0x4105('0x85')][_0x4105('0x93')]['In'],'easing2':TWEEN[_0x4105('0x85')][_0x4105('0x93')][_0x4105('0x89')]};this[_0x4105('0xa6')]=['in',_0x4105('0xa7')];if(_0x2a7579!==undefined)this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=_0x2a7579;this[_0x4105('0xa9')]=new THREE['ShaderMaterial']({'uniforms':this[_0x4105('0xa3')],'vertexShader':_0x5915a7[_0x4105('0xab')],'fragmentShader':_0x5915a7[_0x4105('0xac')]});};THREE[_0x4105('0xdf')][_0x4105('0x7f')]=Object[_0x4105('0x7e')](Object[_0x4105('0xdc')](THREE[_0x4105('0x70')][_0x4105('0x7f')]),{'constructor':THREE[_0x4105('0xdf')],'render':function(_0x4e911e){_0x4e911e[_0x4105('0xa9')]=this[_0x4105('0xa9')];for(var _0x2461a6 in this[_0x4105('0xa4')]){this[_0x4105('0xa3')][_0x2461a6][_0x4105('0xad')]=this[_0x4105('0xa4')][_0x2461a6];}TWEEN['update']();},'resetEffect':function(_0x4d0eba){this[_0x4105('0xa3')][_0x4105('0xa8')]['value']=_0x4d0eba;},'animate':function(_0x16354e,_0x47fd8a){this[_0x4105('0xaf')]=_0x16354e;this[_0x4105('0xa5')]['t1']=0.3*_0x16354e[_0x4105('0xb0')];this[_0x4105('0xa5')]['t2']=0.7*_0x16354e[_0x4105('0xb0')];this[_0x4105('0xa3')]['transitionFrom'][_0x4105('0xad')]=_0x16354e['sliderTextureFrom'];this[_0x4105('0xb1')]=_0x16354e[_0x4105('0x7c')];this[_0x4105('0xc8')]=_0x47fd8a;var _0x19d21e=_0x16354e[_0x4105('0xb2')]>_0x16354e[_0x4105('0xb3')];var _0x5893b7=_0x16354e[_0x4105('0x6c')][_0x4105('0xb4')]();var _0x1808c6=0x3,_0x2508bd=0x1,_0x331553=0x1;this[_0x4105('0xa6')][_0x4105('0x76')](function(_0x331553){if(_0x5893b7['indexOf'](_0x331553)!==-0x1)_0x16354e[_0x4105('0xba')]=_0x331553;});if(_0x5893b7[_0x4105('0x77')]('long')!==-0x1||_0x16354e[_0x4105('0xb6')]===_0x4105('0xb5'))_0x1808c6=0x4;if(_0x5893b7[_0x4105('0x77')](_0x4105('0xb7'))!==-0x1||_0x16354e[_0x4105('0xb6')]==='short')_0x1808c6=0x2;if(_0x5893b7[_0x4105('0x77')](_0x4105('0x6d'))!==-0x1||_0x16354e['brightness']===_0x4105('0x6d'))_0x2508bd=0xa;if(_0x5893b7[_0x4105('0x77')](_0x4105('0x6f'))!==-0x1||_0x16354e[_0x4105('0x6e')]===_0x4105('0x6f'))_0x2508bd=0x0;if(!_0x16354e['direction']){var _0x21357c=STX[_0x4105('0xb8')][_0x4105('0xb9')](0x0,0x3);_0x16354e[_0x4105('0xba')]=this['directions'][_0x21357c];}if(typeof _0x16354e[_0x4105('0xb6')]==_0x4105('0xbb'))_0x1808c6=_0x16354e['distance'];if(typeof _0x16354e[_0x4105('0x6e')]==_0x4105('0xbb'))_0x2508bd=_0x16354e[_0x4105('0x6e')];var _0x42b8f6=_0x4105('0x93');var _0x375bd7=_0x4105('0x93');if(_0x5893b7[_0x4105('0x77')](_0x4105('0xbc'))!==-0x1||_0x16354e[_0x4105('0xbd')]===_0x4105('0xbc')){_0x42b8f6='Sinusoidal';_0x375bd7=_0x4105('0x8f');}if(_0x5893b7[_0x4105('0x77')](_0x4105('0xbe'))!==-0x1||_0x16354e[_0x4105('0xbd')]===_0x4105('0xbe')){_0x42b8f6=_0x4105('0x86');_0x375bd7=_0x4105('0xbf');}if(_0x16354e[_0x4105('0xba')]==='out')_0x1808c6*=-0x1;if(_0x19d21e)_0x1808c6*=-0x1;this[_0x4105('0x73')](_0x1808c6,TWEEN['Easing'][_0x42b8f6]['In'],TWEEN[_0x4105('0x85')][_0x375bd7][_0x4105('0x89')],_0x2508bd);},'zoom':function(_0x1ea1dd,_0x85c3ed,_0x118187,_0x2cee1a){var _0x3d6d2d={'u1':_0x1ea1dd,'u2':0.3,'u3':_0x2cee1a,'easing1':_0x85c3ed,'easing2':_0x118187};this[_0x4105('0xc0')](_0x3d6d2d);},'tween':function(_0x57ccda){for(var _0x58abfa in this[_0x4105('0xa5')]){if(typeof _0x57ccda[_0x58abfa]==_0x4105('0xd8'))_0x57ccda[_0x58abfa]=this[_0x4105('0xa5')][_0x58abfa];}var _0x93ff42=this;var _0x102a0f={'u1':Math[_0x4105('0xd7')](_0x57ccda['u1']),'u2':0x0,'u3':0x1};var _0x19eda8=new TWEEN[(_0x4105('0xc1'))](_0x102a0f)['to']({'u1':_0x57ccda['u1'],'u2':_0x57ccda['u2'],'u3':_0x57ccda['u3']},_0x57ccda['t1'])['easing'](_0x57ccda[_0x4105('0xc2')])[_0x4105('0xc3')](function(){for(var _0x58abfa in _0x102a0f){_0x93ff42[_0x4105('0xa4')][_0x58abfa]=_0x102a0f[_0x58abfa];}})[_0x4105('0xc4')](function(){_0x93ff42[_0x4105('0xc5')]();})[_0x4105('0xc6')]();var _0x5357b2={'u1':-_0x57ccda['u1'],'u2':_0x57ccda['u2'],'u3':_0x57ccda['u3']};var _0x4ffb19=new TWEEN[(_0x4105('0xc1'))](_0x5357b2)['to']({'u1':-Math[_0x4105('0xd7')](_0x57ccda['u1']),'u2':0x0,'u3':0x1},_0x57ccda['t2'])[_0x4105('0xd9')](_0x57ccda['t1'])[_0x4105('0xbd')](_0x57ccda[_0x4105('0xda')])[_0x4105('0xc3')](function(){for(var _0x58abfa in _0x5357b2){_0x93ff42[_0x4105('0xa4')][_0x58abfa]=_0x5357b2[_0x58abfa];}})[_0x4105('0xc4')](function(){_0x93ff42[_0x4105('0xc7')]();})[_0x4105('0xc6')]();},'switchTexture':function(){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=this[_0x4105('0xb1')];this[_0x4105('0xc8')]();}});THREE[_0x4105('0xe1')]=function(_0x234520,_0x545a92,_0x3945c8){THREE[_0x4105('0x70')][_0x4105('0xca')](this,_0x3945c8);if(THREE[_0x4105('0x55')]===undefined)console[_0x4105('0x81')](_0x4105('0xe2'));var _0x46d6d7=THREE['BrightnessShader'];this[_0x4105('0xa3')]=THREE[_0x4105('0xa1')][_0x4105('0xa2')](_0x46d6d7[_0x4105('0xa3')]);this[_0x4105('0xa4')]={'u1':0x1};this[_0x4105('0xa5')]={'u1':0x1,'t1':0x190,'t2':0x258,'easing1':TWEEN[_0x4105('0x85')][_0x4105('0x86')]['In'],'easing2':TWEEN['Easing'][_0x4105('0x86')][_0x4105('0x89')]};this[_0x4105('0xe3')]=[_0x4105('0x6d'),_0x4105('0x6f')];if(_0x234520!==undefined)this['uniforms'][_0x4105('0xa8')]['value']=_0x234520;this[_0x4105('0xa9')]=new THREE['ShaderMaterial']({'uniforms':this[_0x4105('0xa3')],'vertexShader':_0x46d6d7[_0x4105('0xab')],'fragmentShader':_0x46d6d7[_0x4105('0xac')]});};THREE[_0x4105('0xe1')][_0x4105('0x7f')]=Object['assign'](Object[_0x4105('0xdc')](THREE['Effect']['prototype']),{'constructor':THREE[_0x4105('0xe1')],'render':function(_0x15956c){for(var _0x3fe85c in this[_0x4105('0xa4')]){this[_0x4105('0xa3')][_0x3fe85c][_0x4105('0xad')]=this['transform'][_0x3fe85c];}_0x15956c['material']=this[_0x4105('0xa9')];TWEEN[_0x4105('0xae')]();},'resetEffect':function(_0x5e90f3){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=_0x5e90f3;},'animate':function(_0x55e146,_0x1c960d){this[_0x4105('0xaf')]=_0x55e146;this[_0x4105('0xa5')]['t1']=0.4*_0x55e146[_0x4105('0xb0')];this['defaults']['t2']=0.6*_0x55e146['transitionDuration'];this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=_0x55e146[_0x4105('0x78')];this[_0x4105('0xb1')]=_0x55e146[_0x4105('0x7c')];this['pauseVideoCallback']=_0x1c960d;var _0x5df485=_0x55e146[_0x4105('0x6c')][_0x4105('0xb4')]();var _0x52778b=_0x4105('0x8f');var _0x54088a='Cubic';if(_0x5df485[_0x4105('0x77')](_0x4105('0xbe'))!==-0x1||_0x55e146[_0x4105('0xbd')]===_0x4105('0xbe')){_0x52778b=_0x4105('0x86');_0x54088a=_0x4105('0xbf');}if(_0x5df485[_0x4105('0x77')]('slow')!==-0x1||_0x55e146[_0x4105('0xbd')]===_0x4105('0xbc')){_0x52778b='Sinusoidal';_0x54088a=_0x4105('0x86');}if(_0x5df485['indexOf'](_0x4105('0xe4'))!==-0x1||_0x55e146[_0x4105('0xbd')]==='fast'){_0x52778b='Exponential';_0x54088a=_0x4105('0x97');}var _0x4608df=0x1;if(_0x5df485['indexOf'](_0x4105('0x6d'))!==-0x1)_0x4608df=0xa;if(_0x5df485[_0x4105('0x77')](_0x4105('0x6f'))!==-0x1)_0x4608df=0x0;if(typeof _0x55e146[_0x4105('0x6e')]==_0x4105('0xbb'))_0x4608df=_0x55e146['brightness'];this[_0x4105('0x6e')](TWEEN[_0x4105('0x85')][_0x52778b]['In'],TWEEN[_0x4105('0x85')][_0x54088a]['Out'],_0x4608df);},'brightness':function(_0x3136c8,_0x5efda3,_0x71dda){var _0x54295a={'u1':_0x71dda,'easing1':_0x3136c8,'easing2':_0x5efda3};this['tween'](_0x54295a);},'tween':function(_0x1c8d38){for(var _0x51992a in this[_0x4105('0xa5')]){if(typeof _0x1c8d38[_0x51992a]==_0x4105('0xd8'))_0x1c8d38[_0x51992a]=this['defaults'][_0x51992a];}var _0x36cb3c=this;var _0x2032a4={'u1':0x1};var _0x528f5b=new TWEEN[(_0x4105('0xc1'))](_0x2032a4)['to']({'u1':_0x1c8d38['u1']},_0x1c8d38['t1'])[_0x4105('0xbd')](_0x1c8d38[_0x4105('0xc2')])[_0x4105('0xc3')](function(){for(var _0x51992a in _0x2032a4){_0x36cb3c[_0x4105('0xa4')][_0x51992a]=_0x2032a4[_0x51992a];}})['onComplete'](function(){_0x36cb3c[_0x4105('0xc5')]();})['start']();var _0x1e460b={'u1':_0x1c8d38['u1']};var _0x45d414=new TWEEN[(_0x4105('0xc1'))](_0x1e460b)['to']({'u1':0x1},_0x1c8d38['t2'])[_0x4105('0xd9')](_0x1c8d38['t1'])[_0x4105('0xbd')](_0x1c8d38['easing2'])[_0x4105('0xc3')](function(){for(var _0x51992a in _0x1e460b){_0x36cb3c[_0x4105('0xa4')][_0x51992a]=_0x1e460b[_0x51992a];}})[_0x4105('0xc4')](function(){_0x36cb3c['animationComplete']();})[_0x4105('0xc6')]();},'switchTexture':function(){this[_0x4105('0xa3')][_0x4105('0xa8')][_0x4105('0xad')]=this[_0x4105('0xb1')];this[_0x4105('0xc8')]();}});

var STX = STX || {};
/**
 * Main brain for Transition.
 * @param {Object} options - Transition options.
 * @param {Object} options.camera - Camera options of transition slider holder.
 * @param {number} options.camera.height - Camera height of transition slider holder.
 * @param {number} options.camera.width - Camera width of transition slider holder.
 * @param {number} options.camera.fov - Camera field of view of transition slider holder.
 * @param {Object} options.slidesToLoad - Holds json info of each slide with URLs of assets that needs to be load and effect of transition for that slide
 * @constructor
 */
STX.Transition = function(options) {
    var self = this;

    self.options = options;
    self.ev = self.options.ev;
    var width = self.options.camera.width;
    var height = self.options.camera.height;
    var aspect = width / height;
    var fov = self.options.camera.fov;
    var fi = THREE.Math.degToRad(fov / 2);

    self.ev.on("animationComplete", function(event, renderingStatus) {
        if (self.slides[self.currentSlideIndex].mediaType === "IMAGE") {
            self.updateRendering(renderingStatus);
        }
    });
    self.ev.on("onMuteButtonUpdate", function(event, muted) {
        self.updateVideoSlidesWithMuteStatus(muted);
    });
    self.ev.on("onPauseButtonUpdate", function(event, paused) {
        self.updateVideoSlidesWithPauseStatus(paused);
    });
    /**
     *
     * Building THREE.js scene for slider which will hold all textures and where all the magic is happening.
     */
    self.container = self.options.container;
    self.renderer = new THREE.WebGLRenderer({ antialias: false });
    self.renderer.setSize(width, height);
    self.renderer.setClearColor("#000000");
    self.isRendering = true;
    self.initRendering = true;
    self.container.appendChild(self.renderer.domElement);

    self.slides = {};
    self.slides = self.options.slidesToLoad;
    self.currentSlideIndex = self.options.initialSlide;
    self.previousSlideIndex = self.currentSlideIndex;

    self.sliderPaused = false;

    self.camera = new THREE.PerspectiveCamera(fov, aspect, 1, 1000);
    self.scene = new THREE.Scene();

    self.camera.position.z = height / 2 / Math.tan(fi);

    self.getTexture = function(textureId, callback) {
        var slideMediaType = self.slides[textureId].mediaType;

        switch (slideMediaType) {
            case "IMAGE":
                if (!self.slides[textureId].texture) {
                    self.checkForVideoSlideAndPause(self.previousSlideIndex);
                    self.loader.load(
                        self.slides[textureId].src,
                        function(texture) {
                            self.bufferSlideTexture(texture, textureId, callback);
                        },
                        undefined,
                        function(err) {
                            console.error("ERROR on loading texture" + err);
                        }
                    );
                } else {
                    self.bufferSlideTexture(self.slides[textureId].texture, textureId, callback);
                }
                break;

            case "VIDEO":
                if (!self.slides[textureId].videoObject) {
                    for (var index = 0; index < self.slides.length; index++) {
                        if (self.slides[index].videoObject && !self.slides[textureId].videoObject && index !== textureId && self.slides[index].src === self.slides[textureId].src) {
                            self.slides[textureId].videoObject = self.slides[index].videoObject;
                        }
                    }
                }

                if (!self.slides[textureId].videoObject) {
                    self.slides[textureId].videoObject = new THREE.VideoSlideObject({
                        height: options.camera.height,
                        width: options.camera.width,
                        src: self.slides[textureId].src
                    });
                }

                var texture = self.slides[textureId].videoObject.texture;

                if (self.slides[textureId].videoObject.video.readyState < 3) {
                    if (textureId === self.currentSlideIndex) {
                        self.checkForVideoSlideAndPause(self.previousSlideIndex);
                    }
                    self.slides[textureId].videoObject.video.onloadeddata = function() {
                        self.bufferSlideTexture(texture, textureId, callback);
                    };
                } else {
                    self.bufferSlideTexture(texture, textureId, callback);
                }

                break;

            case "NOT_SUPPORTED":
                console.log("Slide media format is not supported, please try with other media file format.");
        }
    };

    self.bufferSlideTexture = function(texture, textureId, callback) {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        self.slides[textureId].texture = texture;
        if (callback) {
            callback();
        }
    };

    self.checkForLoadNextTexture = function(textureId) {
        if (self.slides.length === textureId) {
            textureId = 0;
        }
        if (!self.slides[textureId].texture && self.slides.length >= textureId + 1) {
            self.getTexture(textureId);
        }
    };

    self.checkForVideoSlideAndPlay = function(slideIndex) {
        if (self.slides[slideIndex].videoObject && !self.sliderPaused) {
            self.slides[slideIndex].videoObject.video.play();
        }
    };

    self.checkForVideoSlideAndPause = function(slideIndex) {
        if (self.slides[slideIndex].videoObject) {
            self.slides[slideIndex].videoObject.video.pause();
        }
    };

    self.checkForVideoSlideToShowMuteButton = function(slideIndex) {
        if (self.slides[slideIndex].videoObject) {
            self.ev.trigger("showVideoButtons");
        } else {
            self.ev.trigger("hideVideoButtons");
        }
    };

    self.updateVideoSlidesWithMuteStatus = function(muted) {
        self.slides.forEach(function(slide) {
            if (slide.videoObject) {
                slide.videoObject.video.muted = muted;
            }
        });
    };

    self.updateVideoSlidesWithPauseStatus = function(paused) {
        if (paused) {
            self.slides.forEach(function(slide) {
                if (slide.videoObject) {
                    slide.videoObject.video.pause();
                    self.sliderPaused = true;
                }
            });
        } else {
            self.slides[self.currentSlideIndex].videoObject.video.play();
            self.sliderPaused = false;
        }
    };

    /**
     * Render is taking care for slide to be rendered in relation of transition progress
     */
    self.render = function render() {
        if (self.isRendering) {
            requestAnimationFrame(render);
            self.effectHandler.render();
            self.renderer.render(self.scene, self.camera);
            checkForInitialRenderPass();
        }
    };

    self.reloadTransition = function(options) {
        var initialSlide = options.initialSlide;
        var initialEffect = options.initialEffect;

        self.options = options;
        self.slide.geometry.dispose();
        self.slide.geometry = new THREE.PlaneGeometry(options.camera.width, options.camera.height);
        self.camera.fov = options.camera.fov;
        self.camera.aspect = options.camera.width / options.camera.height;
        self.camera.position.z = options.camera.height / 2 / Math.tan(THREE.Math.degToRad(options.camera.fov / 2));
        self.slides = {};
        self.slides = options.slidesToLoad;
        self.currentSlideIndex = self.options.initialSlide;
        self.previousSlideIndex = self.currentSlideIndex;

        self.ev.trigger("showLoading");
        self.updateRendering(false);

        var slideMediaType = self.slides[initialSlide].mediaType;
        var src = self.slides[initialSlide].src;

        self.updateTransitionOnResize({
            width: options.camera.width,
            height: options.camera.height
        });

        switch (slideMediaType) {
            case "IMAGE":
                self.loader.load(
                    src,
                    function(texture) {
                        setupTransitionAfterReload(texture, initialSlide, initialEffect);
                    },
                    undefined,
                    function(err) {
                        console.error("ERROR on loading texture" + err);
                    }
                );
                break;

            case "VIDEO":
                var videoSlideObject = new THREE.VideoSlideObject({
                    height: options.camera.height,
                    width: options.camera.width,
                    src: src
                });
                self.slides[initialSlide].videoObject = videoSlideObject;
                self.slides[initialSlide].videoObject.video.onloadeddata = function() {
                    setupTransitionAfterReload(self.slides[initialSlide].videoObject.texture, initialSlide, initialEffect);
                };

                break;

            case "NOT_SUPPORTED":
                console.log("Slide media format is not supported, please try with other media file format.");
        }

        function setupTransitionAfterReload(texture, initialSlide, initialEffect) {
            self.ev.trigger("initSwiper");
            self.bufferSlideTexture(texture, initialSlide);
            self.checkForLoadNextTexture(initialSlide + 1);

            self.effectHandler.resetEffectHandler();
            self.effectHandler.addEffect({
                transitionEffect: initialEffect,
                sliderTextureFrom: self.slides[initialSlide].texture
            });
            self.checkForVideoSlideAndPlay(initialSlide);
            self.checkForVideoSlideToShowMuteButton(initialSlide);
        }
    };

    self.pauseAllVideoSlides = function() {
        self.slides.forEach(function(slide) {
            if (slide.videoObject) {
                slide.videoObject.video.pause();
            }
        });
    };

    init(options);

    /**
     * Init of THREE.js Mesh called slide which will hold textures and transitions
     */
    function init(initOptions) {
        var initialSlide = initOptions.initialSlide;
        var initialEffect = initOptions.initialEffect;
        var src = self.slides[initialSlide].src;
        var slideMediaType = self.slides[initialSlide].mediaType;
        self.loader = new THREE.TextureLoader();

        switch (slideMediaType) {
            case "IMAGE":
                self.loader.load(
                    src,
                    function(texture) {
                        initSlideWithTexture(texture);
                    },
                    undefined,
                    function(err) {
                        console.error("ERROR on loading texture" + err);
                    }
                );
                break;

            case "VIDEO":
                var videoSlideObject = new THREE.VideoSlideObject({
                    height: options.camera.height,
                    width: options.camera.width,
                    src: src
                });
                self.slides[initialSlide].videoObject = videoSlideObject;
                self.slides[initialSlide].videoObject.video.onloadeddata = function() {
                    initSlideWithTexture(self.slides[initialSlide].videoObject.texture);
                };

                break;

            case "NOT_SUPPORTED":
                console.log("Slide media format is not supported, please try with other media file format.");
        }

        function initSlideWithTexture(texture) {
            self.ev.trigger("initSwiper");
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            self.slides[initialSlide].texture = texture;
            self.checkForLoadNextTexture(initialSlide + 1);
            //START OF DEMO
            // !location.host.indexOf("transition") || initSlideWithTexture(texture)
            //END OF DEMO
            self.geometry = new THREE.PlaneGeometry(aspect * height, height);
            self.transitionMaterial = new THREE.ShaderMaterial(THREE[initialEffect + "Shader"]);
            self.slide = new THREE.Mesh(self.geometry, self.transitionMaterial);

            self.effectHandler = new THREE.EffectHandler(self.slide, self.ev);
            self.effectHandler.addEffect({
                transitionEffect: initialEffect,
                sliderTextureFrom: self.slides[initialSlide].texture
            });
            self.checkForVideoSlideAndPlay(initialSlide);
            self.checkForVideoSlideToShowMuteButton(initialSlide);
            self.scene.add(self.slide);

            self.render();
        }
    }

    function checkForInitialRenderPass() {
        if (self.initRendering) {
            self.initRendering = false;
            if (self.slides[self.options.initialSlide].mediaType === "IMAGE") {
                self.isRendering = false;
            }
        }
    }
};

STX.Transition.prototype = {
    updateRendering: function(rendering) {
        var self = this;

        if (rendering && !self.isRendering) {
            self.isRendering = true;
            self.render();
        } else if (!rendering && self.isRendering) {
            self.isRendering = false;
        }
    },
    /**
     * Animate is handling which transition will be played between two slides
     * @param {Array} options - Holding all options for one animation
     * @param {String} options.transitionEffect - Name of the transition effect
     * @param {number} options.slideFrom - Integer which is index of slide where transition is starting
     * @param {number} options.slideTo - Integer which is index of slide where transition is ending
     */
    animate: function(options) {
        var self = this;

        self.currentSlideIndex = options.slideTo;
        self.previousSlideIndex = options.slideFrom;
        self.ev.trigger("disableSwiperInteraction");
        self.ev.trigger("showLoading");

        self.getTexture(options.slideTo, function() {
            self.updateRendering(true);
            options.sliderTextureFrom = self.slides[options.slideFrom].texture;
            options.sliderTextureTo = self.slides[options.slideTo].texture;
            self.effectHandler.addEffect({
                transitionEffect: options.transitionEffect,
                sliderTextureFrom: self.slides[options.slideFrom].texture,
                sliderTextureTo: self.slides[options.slideTo].texture
            });
            self.checkForVideoSlideToShowMuteButton(options.slideTo);
            self.effectHandler.animate(options, function() {
                self.checkForVideoSlideAndPause(options.slideFrom);
                self.checkForVideoSlideAndPlay(options.slideTo);
            });
            self.checkForLoadNextTexture(options.slideTo + 1);
            self.ev.trigger("hideLoading");
        });
        //START OF DEMO
        // if(location.href.indexOf("transition") < 0) self.animate(options);
        //END OF DEMO
    },

    updateTransitionOnResize: function(slideSize) {
        var self = this;

        self.updateRendering(true);
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(slideSize.width, slideSize.height);
    }
};
var STX = STX || {};

STX.Loading = function(options, ev) {
    var self = this;

    self.options = options;
    self.ev = ev;

    self.loading = document.createElement("div");
    self.loading.className = "stx-loading";

    self.loading.style.setProperty("background-color", options.backgroundColor);
    setLoadingSpinner(options.spinnerStyle);

    self.showLoading();
    setupEventListeners();

    function setLoadingSpinner(spinnerStyle) {
        self.loadingTextSpinner = function loadingText() {
            var loadingString = "YonneAutos - Garage Auxerre";
            var loadingText = document.createElement("div");

            loadingText.className = "stx-loading-text";
            loadingString.split("").forEach(function(letter) {
                var loadingTextWords = document.createElement("span");
                loadingTextWords.className = "stx-loading-text-words";
                loadingTextWords.innerText = letter;
                loadingText.appendChild(loadingTextWords);
            });

            self.loading.appendChild(loadingText);
        };

        self[spinnerStyle]();
    }

    function setupEventListeners() {
        self.ev.on("showLoading", function() {
            self.showLoading();
        });
        self.ev.on("hideLoading", function() {
            self.hideLoading();
        });
    }
};

STX.Loading.prototype = {
    hideLoading: function() {
        var self = this;

        if (this.options.fadeEffect) fadeOutLoading();
        else this.loading.style.setProperty("visibility", "hidden");

        function fadeOutLoading() {
            self.loading.classList.add("stx-loading-hide-fadeout");
            self.loading.classList.remove("stx-loading-show-fadein");
        }
    },

    showLoading: function() {
        var self = this;

        if (this.options.fadeEffect) fadeInLoading();
        else this.loading.style.setProperty("visibility", "visible");

        function fadeInLoading() {
            self.loading.classList.add("stx-loading-show-fadein");
            self.loading.classList.remove("stx-loading-hide-fadeout");
        }
    },

    getLoadingDivElement: function() {
        var self = this;

        return self.loading;
    }
};
var STX = STX || {};

STX.Buttons = function(options) {
    var self = this;

    self.ev = options.ev;
    self.muteVisible = options.buttons.muteVisible;
    self.pauseVisible = options.buttons.pauseVisible;

    self.muted = true;
    self.paused = false;

    self.$buttonsWrapper = jQuery('<div class="stx-buttons-wrapper">\n' + '<div class="stx-pause">\n' + '<i class="stx-fas stx-fa-pause"></i>\n' + "</div>\n" + '<div class="stx-unmute">\n' + '<i class="stx-fas stx-fa-volume-off"></i>\n' + '<div class="stx-unmute-text"></div>\n' + "</div>\n" + "</div>");
    self.$unmuteButton = self.$buttonsWrapper.find(".stx-unmute");
    self.$pauseButton = self.$buttonsWrapper.find(".stx-pause");

    setupButtonsEventListeners();
    self.hideButtonsWrapper();

    function setupButtonsEventListeners() {
        var text = "";

        self.$unmuteButton.click(function() {
            text = STX.Utils.isMobileDevice() ? "TAP" : "CLICK";
            self.muted = !self.muted;
            if (self.muted) {
                text += " TO UNMUTE";
                jQuery(this)
                    .find(".stx-fas")
                    .removeClass("stx-fas stx-fa-volume-up")
                    .addClass("stx-fas stx-fa-volume-off");
            } else {
                text += " TO MUTE";
                jQuery(this)
                    .find(".stx-fas")
                    .removeClass("stx-fas stx-fa-volume-off")
                    .addClass("stx-fas stx-fa-volume-up");
            }
            jQuery(".stx-unmute-text").text(text);
            self.ev.trigger("onMuteButtonUpdate", [self.muted]);
        });

        self.$pauseButton.click(function() {
            self.paused = !self.paused;
            if (self.paused) {
                jQuery(this)
                    .find(".stx-fas")
                    .removeClass("stx-fas stx-fa-pause")
                    .addClass("stx-fas stx-fa-play");
            } else {
                jQuery(this)
                    .find(".stx-fas")
                    .removeClass("stx-fas stx-fa-play")
                    .addClass("stx-fas stx-fa-pause");
            }
            self.ev.trigger("onPauseButtonUpdate", [self.paused]);
        });

        self.ev.on("showVideoButtons", function() {
            self.showButtonsWrapper();
        });
        self.ev.on("hideVideoButtons", function() {
            self.hideButtonsWrapper();
        });
    }
};

STX.Buttons.prototype = {
    hideButtonsWrapper: function() {
        var self = this;


        self.$buttonsWrapper.fadeOut(300, function() {
            if (!self.muteVisible) self.$unmuteButton.hide();
            if (!self.pauseVisible) self.$pauseButton.hide();
            self.$buttonsWrapper.hide();
        });
    },

    showButtonsWrapper: function() {
        var self = this;

        var text = STX.Utils.isMobileDevice() ? "TAP" : "CLICK";
        text += self.muted ? " TO UNMUTE" : " TO MUTE";
        jQuery(".stx-unmute-text").text(text);

        self.$buttonsWrapper.fadeIn(300, function() {
            if (self.muteVisible) self.$unmuteButton.show();
            if (self.pauseVisible) self.$pauseButton.show();
            self.$buttonsWrapper.show();
        });
    },

    getUnmuteDivElement: function() {
        var self = this;

        return self.$buttonsWrapper;
    }
};
var STX = STX || {};

STX.Utils = {
    checkForSupportedMediaType: function(url) {
        var mediaType;
        var mediaExtension;

        mediaExtension = new RegExp("\\.\\w{3,4}($|\\?)", "g").exec(url)[0];

        for (const supportedMediaType in STX.Utils.supportedMediaTypes) {
            if (STX.Utils.supportedMediaTypes[supportedMediaType].includes(mediaExtension)) {
                mediaType = supportedMediaType;
                break;
            }
            mediaType = STX.Utils.supportedMediaTypes.NOT_SUPPORTED;
        }

        return {
            mediaType: mediaType,
            mediaExtension: mediaExtension
        };
    },

    isMobileDevice: function() {
        return typeof window.orientation !== "undefined" || navigator.userAgent.indexOf("IEMobile") !== -1;
    },

    capitalize: function(str){
        return str.charAt(0).toUpperCase() + str.slice(1)
    },

    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    transitionEffect: {
        SIMPLE_WAVE: "SimpleWave",
        ZOOM_IN: "ZoomIn",
        SIMPLE: "Simple",
        TWIRL: "Twirl",
        WARP: "Warp",
        ROLL_TOP_LEFT: "RollTopLeft",
        TEST: "Test",
        BLACK_FADE: "BlackFade",
        FLASH: "Flash",
        ROLL: "Roll"
    },

    supportedMediaTypes: {
        VIDEO: [".mp4"],
        IMAGE: [".jpg", ".png", ".bmp"],
        NOT_SUPPORTED: "notSupported"
    },

    navigation: {
        nextEl: ".slider-button-next-",
        prevEl: ".slider-button-prev-",
        navigationStyleClass: "slider-button-"
    },

    pagination: {
        type: {
            bullets: ["effect1", "effect2", "effect5"],
            fraction: ["effect3", "effect4"]
        },
        el: ".swiper-pagination",
        modifierClass: "swiper-pagination-",
        bulletClass: "swiper-pagination-bullet-",
        bulletActiveClass: "swiper-pagination-bullet-active-"
    }
};
