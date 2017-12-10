// ==UserScript==
// @name        PonyTown Outlines
// @namespace   azedith
// @include     https://pony.town/*
// @author      @NotMyWing
// @version     0.29.0pre2
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/color-js/1.0.1/color.min.js
// @require     https://raw.githubusercontent.com/Neeve01/PonyTown-Import-Export/master/ponytown_utils.js
// @downloadURL	https://github.com/Neeve01/PonyTown-Outlines/raw/master/PonyTown_Outlines.user.js
// ==/UserScript==

(function(window, document) {
    'use strict';

    var rgb2hex = (r, g, b) => ((1 << 24 | Math.ceil(r) << 16 | Math.ceil(g) << 8 | Math.ceil(b)) >>> 0).toString(16).substr(1);
    var clamp = (a, min, max) => a > max ? max : (a < min ? min : a);

    var Color = net.brehaut.Color;
    var isMouseDown = false;
    document.addEventListener("mousedown", function() {
        isMouseDown = true;
    });
    document.addEventListener("mouseup", function() {
        isMouseDown = false;
    });

    var __cursorX;
    var __cursorY;
    document.onmousemove = function(e) {
        __cursorX = e.clientX;
        __cursorY = e.clientY;
    }

    var mousePos = function() {
        return {
            x: __cursorX,
            y: __cursorY
        };
    };

    var tryColor = function(v) {
        var clr = Color(v);
        if (clr.toString() == "rgba(0,0,0,0)") {
            clr = Color("#" + v);
            if (clr == "rgba(0,0,0,0)")
                return;
        }
        return clr;
    }

    var Injection = {
        Style: `
        .nmw-display-always {
            display: block;
        }

        .nmw-color-picker-dropdown {
            display: flex;
            position: absolute;
            top: 0;
            right: 0;
            color: #888;
            height: 100%;
        }

        .nmw-outline-picker-adjust {
            color: #888;
            height: 100%;
            padding: 7px 0;
            text-align: center;
        }

        .nmw-outline-adjust-dropdown-menu {
            position: absolute;
            top: 100%;
            z-index: 5;
            display: none;
            padding: .5rem 10%;
            margin-top: .125rem;
            font-size: 1rem;
            color: #eee;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid rgba(0,0,0,.15);
            border-radius: .25rem;
            right: 34%;
        }

        .nmw-outline-adjust-dropdown-menu:after {
            content: "";
            display: inline-block;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 6px solid #fff;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translate(-50%, 0);
        }

        .nmw-outline-adjust-dropdown-menu.show {
            display: block;
        }

        .nmw-outline-adjust-content {
            position: relative;
            display: flex;
        }

        .nmw-outline-adjust-p {
            top: 0;
            height: 175px;
            width: 1rem;

        }

        .nmw-outline-adjust-p-slider {
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
        }

        .nmw-outline-picker-pointer {
            min-width: 3rem;
            position: absolute;
            left: 125%;
            background-color: #c50000;
            height: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding-left: 10%;
            padding-right: 15%;
            font-size: 80%;
            cursor: pointer;
            transform: translate(0, -50%);
            user-select: none;
        }

        .nmw-outline-picker-pointer-left {
            min-width: 3rem;
            position: absolute;
            left: -100%;
            background-color: #c50000;
            height: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding-left: 10%;
            padding-right: 15%;
            font-size: 80%;
            cursor: pointer;
            transform: translate(-50%, -50%);
            user-select: none;
        }

        .nmw-outline-picker-pointer:after {
            content: "";
            border-top: 0.5rem solid transparent;
            border-bottom: 0.5rem solid transparent;
            border-right: 0.5rem solid #c50000;
            position: absolute;
            left: 0;
            transform: translate(-100%, 0);
            bottom: 0;
        }

        .nmw-outline-picker-pointer-left:after {
            content: "";
            border-top: 0.5rem solid transparent;
            border-bottom: 0.5rem solid transparent;
            border-left: 0.5rem solid #c50000;
            position: absolute;
            left: 100%;
            bottom: 0;
        }

        .nmw-outline-adjust-p-slider > div {
            left: 0;
            top: -2px;
            right: 0;
            height: 5px;
            position: absolute;
            border: 1px solid #000;
            box-shadow: 0 0 0 2px #fff;
        }
        `,
        CSS_RGB_Regex: /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
        InjectedCSSTag: null,
        ChevronStyle: null,
        ActiveDropdown: null,
        ActiveFlllOutline: null,
        ActiveMainDropdown: null,
        HideDropdown: function(ev) {
            if (ev && Injection.ActiveDropdown && ev.path[0]) {
                if (Injection.ActiveDropdown.contains(ev.path[0])) {
                    return;
                }

                let el = Injection.ActiveDropdown.parentNode.querySelector(".nmw-outline-picker-adjust");

                if (el && el.contains(ev.path[0])) {
                    return;
                }

                let p = Injection.ActiveFlllOutline.querySelector(".col-8.col-sm-4");
                if (p && p.contains(ev.path[0])) {
                    return;
                }
            }
            if (Injection.ActiveDropdown) {
                var ad = Injection.ActiveDropdown;
                if (Injection.ActiveMainDropdown.classList.contains("nmw-display-always"))
                    Injection.ActiveMainDropdown.classList.remove("nmw-display-always");
                if (Injection.ActiveMainDropdown.classList.contains("show"))
                    Injection.ActiveMainDropdown.classList.remove("show");

                if (Injection.OutlinePickerTimer)
                    clearInterval(Injection.OutlinePickerTimer);
                Injection.ActiveDropdown.classList.remove("show");
                Injection.ActiveDropdown = null;
                Injection.ActiveMainDropdown = null;

                return ad;
            }
        },
        OutlinePickerTimer: null,
        Inject: function(fill_outline) {
            var injection = this;

            if (!this.InjectedCSSTag) {
                var head = document.querySelector("head");
                var css = this.InjectedCSSTag = document.createElement("style");
                css.type = "text/css";
                css.innerHTML = this.Style;

                head.appendChild(css);
            }

            var color_pickers = fill_outline.querySelectorAll("color-picker");
            if (color_pickers[1]) {
                var chevron = color_pickers[1].querySelector(".color-picker-chevron");

                // Cache style, since it's computed on page load.
                if (!this.ChevronStyle) {
                    var st = getComputedStyle(chevron);
                    this.ChevronStyle = {};

                    var w = st.width.match(/(\d+)px/)[1];
                    this.ChevronStyle.width = (w * 0.5) + "px";
                    this.ChevronStyle.container_padding = (w * 0.15) + "px";
                }

                // Restyle chevron. I would make it different style, but that's a quicker approach.
                chevron.style.width = this.ChevronStyle.width;
                chevron.style.position = "static";
                chevron.style.top = "auto";
                chevron.style.right = "auto";

                // Remove chevron, dropdown and place them into container.
                var dropdown = chevron.parentNode;
                var d = dropdown.querySelector(".dropdown-menu");
                d.remove();
                chevron.remove();

                // Create container.
                var container = document.createElement("div");
                container.classList.add("nmw-color-picker-dropdown");
                container.style.paddingRight = this.ChevronStyle.container_padding;
                dropdown.appendChild(container);

                // Create adjust menu.
                var adjust_menu = document.createElement("div");
                adjust_menu.classList.add("nmw-outline-adjust-dropdown-menu");
                adjust_menu.classList.add("dropdown-menu-right");
                adjust_menu.classList.add("color-picker-menu");

                // Create contents.
                var adjust_menu_container = document.createElement("div")
                adjust_menu_container.classList.add("nmw-outline-adjust-content");
                adjust_menu.appendChild(adjust_menu_container);

                // Create picker.
                var shouldChange = false;
                var adjust_menu_picker = document.createElement("div")
                adjust_menu_picker.classList.add("nmw-outline-adjust-p");
                adjust_menu_container.appendChild(adjust_menu_picker);

                // Create sample.
                var adjust_menu_sample = document.createElement("div");
                adjust_menu_sample.classList.add("nmw-outline-adjust-p");

                adjust_menu_container.prepend(adjust_menu_sample);
                // Create slider.
                var adjust_menu_slider = document.createElement("div");
                adjust_menu_slider.innerHTML = "<div></div>";
                adjust_menu_slider.classList.add("nmw-outline-adjust-p-slider");
                adjust_menu_picker.appendChild(adjust_menu_slider);

                // Create main pointer 
                var main_pointer = document.createElement("div");
                main_pointer.classList.add("nmw-outline-picker-pointer-left");
                main_pointer.innerHTML = "main";
                adjust_menu_picker.appendChild(main_pointer);

                // Create shade pointer 
                var shade_pointer = document.createElement("div");
                shade_pointer.classList.add("nmw-outline-picker-pointer");
                shade_pointer.innerHTML = "shade";
                adjust_menu_picker.appendChild(shade_pointer);

                // Inputs stuff.
                var pickerbox = color_pickers[0].querySelector(".color-picker-box");
                var outline_pickerbox = color_pickers[1].querySelector(".color-picker-box");

                var inputs = fill_outline.querySelectorAll("color-picker > div > input");

                function setOutlineValue(pct, should_force) {
                    var [main, outline] = PonyTownUtils.GetFillOutlineValues(fill_outline);

                    outline = tryColor(main);

                    outline = outline.setValue(should_force ? outline.getValue() / pct : 1 - pct);
                    if (outline.getValue() > 1) {
                        if (!should_force)
                            return;

                        main = tryColor(main);
                        main = main.setValue(pct);

                        outline = tryColor(main);
                        outline = outline.setValue(1);
                    }
                    main = main.toString();
                    outline = outline.toString();

                    PonyTownUtils.SetFillOutlineValues(fill_outline, [main.startsWith("#") ? main.substring(1) : main, outline.startsWith("#") ? outline.substring(1) : outline]);
                }

                adjust_menu_picker.onmousedown = function(ev) {
                    shouldChange = true;
                    injection.OutlinePickerTimer = setInterval(function() {
                        if (!isMouseDown) {
                            return;
                        };

                        let rect = adjust_menu_picker.getBoundingClientRect();
                        //let offset = clamp(pageY - rect.Y, 0, rect.height);
                        let mpos = mousePos();
                        let pct = Math.max(0.01, clamp(mpos.y - rect.y, 0, rect.height) / rect.height);

                        var [main, outline] = PonyTownUtils.GetFillOutlineValues(fill_outline);

                        adjust_menu_slider.style.top = clamp(pct * 100, 0, 100) + "%";

                        setOutlineValue(pct)
                    }, 1000 / 60);
                    ev.preventDefault();
                };
                adjust_menu_picker.onmouseup = function(ev) {
                    if (injection.OutlinePickerTimer)
                        clearInterval(injection.OutlinePickerTimer);
                    ev.preventDefault();
                };
                adjust_menu_sample.onmousedown = adjust_menu_picker.onmousedown;
                adjust_menu_sample.onmouseup = adjust_menu_picker.onmouseup;

                main_pointer.onmousedown = function(ev) { ev.stopPropagation() }
                main_pointer.onmouseup = function(ev) { ev.stopPropagation() }
                main_pointer.onclick = function(ev) {
                    setOutlineValue(0.62, true);
                    adjust_menu_slider.style.top = "0%";

                    ev.stopPropagation()
                }
                shade_pointer.onmousedown = function(ev) { ev.stopPropagation() }
                shade_pointer.onmouseup = function(ev) { ev.stopPropagation() }
                shade_pointer.onclick = function(ev) {
                    setOutlineValue(0.8, true);
                    ev.stopPropagation()
                }

                // And return chevron/dropdown back, also prepend hidden adjust.
                container.appendChild(chevron);
                container.appendChild(adjust_menu);
                container.appendChild(d);

                // Add an adjust button.
                var adjust = document.createElement("div");
                var i = document.createElement("i");
                i.classList.add("fa")
                i.classList.add("fa-fw")
                i.classList.add("fa-adjust")
                adjust.appendChild(i);
                adjust.classList.add("nmw-outline-picker-adjust");

                container.prepend(adjust);

                var main_watch = function() {
                    var picker = adjust_menu_picker;
                    var sample = adjust_menu_sample;

                    //main_pointer
                    //shade_pointer
                    var c = pickerbox.style.backgroundColor;

                    var color = Color(c);
                    if (color) {
                        // main_pointer.style.top = clamp(100 - (color.getValue() * 100), 0, 100) + "%";
                        main_pointer.style.top = "0%";
                        shade_pointer.style.top = clamp(100 - (color.getValue() * 100 / 0.8), 0, 100) + "%";

                        color = color.setValue(0.8);
                        sample.style.backgroundColor = c;
                        picker.style.backgroundImage = "linear-gradient(" + color.toString() + ", #000)";
                    }
                }

                color_pickers[0].querySelector(".color-picker-box").addEventListener("color-change", main_watch, true);

                // Add on-click and such.
                adjust.onclick = function() {
                    var [main, outline] = PonyTownUtils.GetFillOutlineValues(fill_outline);
                    if (!outline)
                        return;

                    if (injection.HideDropdown() == adjust_menu)
                        return;
                    if (!adjust_menu.classList.contains("show")) {
                        let main_picker = fill_outline.querySelector("color-picker");
                        let chevron = main_picker.querySelector(".color-picker-chevron");
                        main_picker = main_picker.querySelector(".dropdown-menu");
                        /*if (!main_picker.classList.contains("show")) {
                            chevron.dispatchEvent(new Event("mousedown"));
                            chevron.dispatchEvent(new Event("mouseup"));
                        }*/
                        if (!main_picker.classList.contains("nmw-display-always"))
                            main_picker.classList.add("nmw-display-always");

                        injection.ActiveDropdown = adjust_menu;
                        injection.ActiveFlllOutline = fill_outline;
                        injection.ActiveMainDropdown = main_picker;
                        adjust_menu.classList.add("show");
                    }
                }

                // Trigger it once to update.
                main_watch();
            }
        }
    }

    var observer_target = document.querySelector("pony-town-app");

    if (!observer_target) {
        return;
    }

    // Set observer.
    var event_added = false;
    var color_change_event = new Event("color-change");
    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var element = mutations[i].target;
            if (mutations[i].removedNodes.length === 0 && element.tagName == "FILL-OUTLINE") {
                if (!event_added) {
                    event_added = true;
                    document.addEventListener("click", Injection.HideDropdown);
                }
                Injection.Inject(element);
            }

            if (element.classList && element.classList.contains("color-picker-box")) {
                element.dispatchEvent(color_change_event);
            }
        }
    });

    observer.observe(observer_target, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
    });

    window.Injection = Injection;
})(window, document);
