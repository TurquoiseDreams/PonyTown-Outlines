// ==UserScript==
// @name        PonyTown Outlines
// @namespace   azedith
// @include     https://pony.town/*
// @author      @NotMyWing
// @version     0.31.0pre1
// @grant       none
// @downloadURL	https://github.com/Neeve01/PonyTown-Outlines/raw/master/PonyTown_Outlines.user.js
// @require     https://raw.githubusercontent.com/Neeve01/PonyTown-Import-Export/master/ponytown_utils.js
// ==/UserScript==

(function(window, document) {
    'use strict';

    var rgb2hex = (r, g, b) => ((1 << 24 | Math.ceil(r) << 16 | Math.ceil(g) << 8 | Math.ceil(b)) >>> 0).toString(16).substr(1);
    var svg = {
        link: '<svg version="1.1" class="nmw-color-picker-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 465.951 465.951"><path d="M441.962,284.364l-59.389-59.383c-15.984-15.985-35.396-23.982-58.238-23.982c-23.223,0-43.013,8.375-59.385,25.125l-25.125-25.125c16.751-16.368,25.125-36.256,25.125-59.671c0-22.841-7.898-42.157-23.698-57.958l-58.815-59.097c-15.798-16.178-35.212-24.27-58.242-24.27c-22.841,0-42.16,7.902-57.958,23.7L24.267,65.386C8.088,81.188,0,100.504,0,123.343c0,22.841,7.996,42.258,23.982,58.245l59.385,59.383c15.99,15.988,35.404,23.982,58.245,23.982c23.219,0,43.015-8.374,59.383-25.126l25.125,25.126c-16.75,16.371-25.125,36.258-25.125,59.672c0,22.843,7.898,42.154,23.697,57.958l58.82,59.094c15.801,16.177,35.208,24.27,58.238,24.27c22.844,0,42.154-7.897,57.958-23.698l41.973-41.682c16.177-15.804,24.271-35.118,24.271-57.958C465.947,319.771,457.953,300.359,441.962,284.364z M200.999,162.178c-0.571-0.571-2.334-2.378-5.28-5.424c-2.948-3.046-4.995-5.092-6.136-6.14c-1.143-1.047-2.952-2.474-5.426-4.286c-2.478-1.809-4.902-3.044-7.28-3.711c-2.38-0.666-4.998-0.998-7.854-0.998c-7.611,0-14.084,2.666-19.414,7.993c-5.33,5.327-7.992,11.799-7.992,19.414c0,2.853,0.332,5.471,0.998,7.851c0.666,2.382,1.903,4.808,3.711,7.281c1.809,2.474,3.237,4.283,4.283,5.426c1.044,1.141,3.09,3.188,6.136,6.139c3.046,2.95,4.853,4.709,5.424,5.281c-5.711,5.898-12.563,8.848-20.555,8.848c-7.804,0-14.277-2.568-19.414-7.705L62.81,142.761c-5.327-5.33-7.992-11.802-7.992-19.417c0-7.421,2.662-13.796,7.992-19.126l41.971-41.687c5.523-5.14,11.991-7.705,19.417-7.705c7.611,0,14.083,2.663,19.414,7.993l58.813,59.097c5.33,5.33,7.992,11.801,7.992,19.414C210.418,149.321,207.278,156.27,200.999,162.178z M403.147,361.732l-41.973,41.686c-5.332,4.945-11.8,7.423-19.418,7.423c-7.809,0-14.27-2.566-19.41-7.707l-58.813-59.101c-5.331-5.332-7.99-11.8-7.99-19.41c0-7.994,3.138-14.941,9.421-20.841c0.575,0.567,2.334,2.381,5.284,5.42c2.95,3.046,4.996,5.093,6.14,6.14c1.143,1.051,2.949,2.478,5.42,4.288c2.478,1.811,4.9,3.049,7.282,3.713c2.382,0.667,4.997,0.999,7.851,0.999c7.618,0,14.086-2.665,19.418-7.994c5.324-5.328,7.994-11.8,7.994-19.41c0-2.854-0.339-5.472-1-7.851c-0.67-2.382-1.902-4.809-3.72-7.282c-1.811-2.471-3.23-4.284-4.281-5.428c-1.047-1.136-3.094-3.183-6.139-6.14c-3.046-2.949-4.853-4.709-5.428-5.276c5.715-6.092,12.566-9.138,20.554-9.138c7.617,0,14.085,2.663,19.41,7.994l59.388,59.382c5.332,5.332,7.995,11.807,7.995,19.417C411.132,350.032,408.469,356.415,403.147,361.732z"/></svg>',
        unlink: '<svg version="1.1" class="nmw-color-picker-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 475.082 475.082"><path d="M107.067,317.195c1.713-1.708,2.568-3.898,2.568-6.563c0-2.663-0.855-4.853-2.568-6.571c-1.714-1.707-3.905-2.562-6.567-2.562H9.135c-2.666,0-4.853,0.855-6.567,2.562C0.859,305.772,0,307.962,0,310.632c0,2.665,0.855,4.855,2.568,6.563c1.714,1.711,3.905,2.566,6.567,2.566H100.5C103.166,319.766,105.353,318.91,107.067,317.195z"/><path d="M310.629,109.634c2.669,0,4.859-0.855,6.563-2.568c1.718-1.711,2.574-3.901,2.574-6.567V9.138c0-2.659-0.856-4.85-2.574-6.565c-1.704-1.711-3.895-2.57-6.563-2.57c-2.662,0-4.853,0.859-6.563,2.57c-1.711,1.713-2.566,3.903-2.566,6.565v91.361c0,2.666,0.855,4.856,2.566,6.567C305.784,108.779,307.974,109.634,310.629,109.634z"/><path d="M118.771,347.184c-2.478,0-4.664,0.855-6.567,2.563l-73.089,73.087c-1.713,1.902-2.568,4.093-2.568,6.567c0,2.474,0.855,4.664,2.568,6.566c2.096,1.708,4.283,2.57,6.567,2.57c2.475,0,4.665-0.862,6.567-2.57l73.089-73.087c1.714-1.902,2.568-4.093,2.568-6.57c0-2.471-0.854-4.661-2.568-6.563C123.436,348.039,121.245,347.184,118.771,347.184z"/><path d="M356.315,127.905c2.283,0,4.473-0.855,6.571-2.565l73.087-73.089c1.707-1.903,2.562-4.093,2.562-6.567c0-2.475-0.855-4.665-2.562-6.567c-1.91-1.709-4.093-2.568-6.571-2.568c-2.471,0-4.66,0.859-6.563,2.568l-73.087,73.089c-1.708,1.903-2.57,4.093-2.57,6.567c0,2.474,0.862,4.661,2.57,6.567C351.846,127.05,354.037,127.905,356.315,127.905z"/><path d="M350.607,193.005c-4-3.999-9.328-7.994-15.988-11.991l-5.14,68.238l78.23,78.508c5.328,5.328,7.987,11.807,7.987,19.417c0,7.423-2.662,13.802-7.987,19.13l-41.977,41.686c-5.146,5.146-11.608,7.666-19.417,7.566c-7.81-0.1-14.271-2.707-19.411-7.854l-77.946-78.225l-68.234,5.144c3.999,6.656,7.993,11.988,11.991,15.985l95.362,95.643c15.803,16.18,35.207,24.27,58.238,24.27c22.846,0,42.154-7.898,57.957-23.695l41.977-41.685c16.173-15.8,24.27-35.115,24.27-57.958c0-22.46-7.994-41.877-23.982-58.248L350.607,193.005z"/><path d="M472.518,157.889c-1.711-1.709-3.901-2.565-6.563-2.565h-91.365c-2.662,0-4.853,0.855-6.563,2.565c-1.715,1.713-2.57,3.903-2.57,6.567c0,2.666,0.855,4.856,2.57,6.567c1.711,1.712,3.901,2.568,6.563,2.568h91.365c2.662,0,4.853-0.856,6.563-2.568c1.708-1.711,2.563-3.901,2.563-6.567C475.082,161.792,474.226,159.602,472.518,157.889z"/><path d="M109.348,67.099c5.523-5.14,11.991-7.705,19.417-7.705c7.611,0,14.084,2.663,19.414,7.993l77.943,78.227l68.234-5.142c-4-6.661-7.99-11.991-11.991-15.987l-95.358-95.643c-15.798-16.178-35.212-24.27-58.242-24.27c-22.841,0-42.16,7.902-57.958,23.7L28.837,69.955C12.659,85.756,4.57,105.073,4.57,127.912c0,22.463,7.996,41.877,23.982,58.245l95.93,95.93c3.995,4.001,9.325,7.995,15.986,11.991l5.139-68.521L67.377,147.33c-5.327-5.33-7.992-11.801-7.992-19.417c0-7.421,2.662-13.796,7.992-19.126L109.348,67.099z"/><path d="M164.454,365.451c-2.667,0-4.854,0.855-6.567,2.563c-1.711,1.711-2.568,3.901-2.568,6.57v91.358c0,2.669,0.854,4.853,2.568,6.57c1.713,1.707,3.9,2.566,6.567,2.566c2.666,0,4.853-0.859,6.567-2.566c1.713-1.718,2.568-3.901,2.568-6.57v-91.358c0-2.662-0.855-4.853-2.568-6.57C169.306,366.307,167.116,365.451,164.454,365.451z"/></svg>'
    }


    let Injection = {
        Style: `
        .nmw-color-picker-dropdown {
            display: flex;
            position: absolute;
            top: 0;
            right: 0;
            color: #888;
            height: 100%;
        }

        .nmw-color-picker-chain {
            color: #888;
            height: 100%;
            padding: 7px 0;
            text-align: center;
        }

        .nmw-color-picker-svg {
            width: 0.95em;
        }
        `,
        CSS_RGB_Regex: /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
        InjectedCSSTag: null,
        ChevronStyle: null,
        SetChain: function(e, state) {
            if (!e.querySelector("svg")) {
                e.setAttribute("state", !state);
            }

            let e_state = e.getAttribute("state")
            if (e_state != state.toString()) {
                e.setAttribute("state", state);
                let s = e.querySelector("svg")
                if (s)
                    s.remove()

                if (state)
                    e.innerHTML = svg.link;
                else
                    e.innerHTML = svg.unlink;
            }
        },
        Inject: function(fill_outline) {
            let injection = this;

            if (!this.InjectedCSSTag) {
                let head = document.querySelector("head");
                let css = this.InjectedCSSTag = document.createElement("style");
                css.type = "text/css";
                css.innerHTML = this.Style;

                head.appendChild(css);
            }

            let color_pickers = fill_outline.querySelectorAll("color-picker");
            if (color_pickers[1]) {
                let chevron = color_pickers[1].querySelector(".color-picker-chevron");

                // Cache style, since it's computed on page load.
                if (!this.ChevronStyle) {
                    let st = getComputedStyle(chevron);
                    this.ChevronStyle = {};

                    let w = st.width.match(/(\d+)px/)[1];
                    this.ChevronStyle.width = (w * 0.5) + "px";
                    this.ChevronStyle.container_padding = (w * 0.15) + "px";
                }

                // Restyle chevron. I would make it different style, but that's a quicker approach.
                chevron.style.width = this.ChevronStyle.width;
                chevron.style.position = "static";
                chevron.style.top = "auto";
                chevron.style.right = "auto";

                // Remove chevron, dropdown and place them into container.
                let dropdown = chevron.parentNode;
                let d = dropdown.querySelector(".dropdown-menu");
                d.remove();
                chevron.remove();

                // Create container.
                let container = document.createElement("div");
                container.classList.add("nmw-color-picker-dropdown");
                container.style.paddingRight = this.ChevronStyle.container_padding;
                dropdown.appendChild(container);

                // And return chevron/dropdown back.
                container.appendChild(chevron);
                container.appendChild(d);

                // Add a chain button.
                let chain = document.createElement("div");
                chain.classList.add("nmw-color-picker-chain");
                this.SetChain(chain, true);

                container.prepend(chain);

                // Watch inputs' changes.
                let pickerbox = color_pickers[0].querySelector(".color-picker-box");
                let outline_pickerbox = color_pickers[1].querySelector(".color-picker-box");

                let inputs = fill_outline.querySelectorAll("color-picker > div > input");

                let get_colors = function() {
                    let color = pickerbox.style.backgroundColor;
                    let outline_color = outline_pickerbox.style.backgroundColor;
                    let c = injection.CSS_RGB_Regex.exec(color);
                    let current_main = {
                        r: Number(c[1]),
                        g: Number(c[2]),
                        b: Number(c[3])
                    }

                    c = injection.CSS_RGB_Regex.exec(outline_color);
                    let current_outline = {
                        r: Number(c[1]),
                        g: Number(c[2]),
                        b: Number(c[3])
                    }

                    let outline_mul = (5 / 8);
                    let outline_mimic_colors = {
                        r: Math.ceil(current_main.r / outline_mul),
                        g: Math.ceil(current_main.g / outline_mul),
                        b: Math.ceil(current_main.b / outline_mul),
                    }

                    let shade_mul = (204 / 255);
                    let shade_mimic_colors = {
                        r: Math.ceil(current_main.r / shade_mul),
                        g: Math.ceil(current_main.g / shade_mul),
                        b: Math.ceil(current_main.b / shade_mul),
                    }

                    return [current_main, current_outline, outline_mimic_colors, shade_mimic_colors];
                }
                let main_watch = function() {
                    let [current_main, current_outline, outline_mimic_colors, shade_mimic_colors] = get_colors();

                    if (outline_mimic_colors.r <= 255 && outline_mimic_colors.g <= 255 && outline_mimic_colors.b <= 255) {
                        chain.style.fill = "#AAA";
                    } else if (shade_mimic_colors.r <= 255 && shade_mimic_colors.g <= 255 && shade_mimic_colors.b <= 255) {
                        chain.style.fill = "#666";
                    } else {
                        chain.style.fill = "#444";
                        injection.SetChain(chain, false);
                        return;
                    }
                    injection.SetChain(chain, true);
                }

                color_pickers[0].querySelector(".color-picker-box").addEventListener("color-change", main_watch, true);

                // Add on-click and such.
                chain.onclick = function() {
                    let [main, outline] = PonyTownUtils.GetFillOutlineValues(fill_outline);

                    if (main && outline) {
                        let [current_main, current_outline, outline_mimic_colors, shade_mimic_colors] = get_colors();

                        if (outline_mimic_colors.r <= 255 && outline_mimic_colors.g <= 255 && outline_mimic_colors.b <= 255) {
                            if (outline_mimic_colors.r == current_outline.r &&
                                outline_mimic_colors.g == current_outline.g &&
                                outline_mimic_colors.b == current_outline.b) {
                                outline = rgb2hex(shade_mimic_colors.r, shade_mimic_colors.g, shade_mimic_colors.b);
                            } else {
                                outline = rgb2hex(outline_mimic_colors.r, outline_mimic_colors.g, outline_mimic_colors.b);
                            }
                        } else if (shade_mimic_colors.r <= 255 && shade_mimic_colors.g <= 255 && shade_mimic_colors.b <= 255) {
                            outline = rgb2hex(shade_mimic_colors.r, shade_mimic_colors.g, shade_mimic_colors.b);
                        } else {
                            return;
                        }
                        PonyTownUtils.SetFillOutlineValues(fill_outline, [main, outline]);
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
    let color_change_event = new Event("color-change");
    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            let element = mutations[i].target;
            if (mutations[i].removedNodes.length === 0 && element.tagName == "FILL-OUTLINE") {
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
})(window, document);
