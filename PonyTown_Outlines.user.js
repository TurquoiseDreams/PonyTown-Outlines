// ==UserScript==
// @name        PonyTown Outlines
// @namespace   azedith
// @include     https://pony.town/*
// @author      @NotMyWing
// @version     0.28.4a
// @grant       none
// @downloadURL	https://github.com/Neeve01/PonyTown-Outlines/raw/master/PonyTown_Outlines.user.js
// ==/UserScript==

(function(window, document) {
    'use strict';

    var rgb2hex = (r, g, b) => ((1 << 24 | Math.ceil(r) << 16 | Math.ceil(g) << 8 | Math.ceil(b)) >>> 0).toString(16).substr(1);

    var clickEvent = new Event('click');
    var inputEvent = new Event('input');
    var mousedownEvent = new Event('mousedown');
    var mouseupEvent = new Event('mouseup');

    var Utils = {
        IsCheckboxChecked: function(element) {
            return element.children[0].children.length > 0;
        },
        GetFillOutlineValues: function(element) {
            if (element.tagName == "FILL-OUTLINE") {
                let divs = element.querySelectorAll("fill-outline > div > div");
                let color = null,
                    outline = null;

                if (divs[0] && divs[1]) {
                    let checkbox = divs[0].querySelector("check-box");
                    if (!checkbox || (checkbox && !this.IsCheckboxChecked(checkbox))) {
                        let picker = divs[1].querySelector("color-picker");
                        color = this.GetTextValue(picker);
                    }
                }

                if (divs[2] && divs[3]) {
                    let checkbox = divs[2].querySelector("check-box");
                    if (!checkbox || (checkbox && !this.IsCheckboxChecked(checkbox))) {
                        let picker = divs[3].querySelector("color-picker");
                        outline = this.GetTextValue(picker);
                    }
                }

                return [color, outline]
            }
        },
        SetFillOutlineValues: function(element, value) {
            if (element.tagName == "FILL-OUTLINE") {
                let color = value[0] || null;
                let outline = value[1] || null;

                let divs = element.querySelectorAll("fill-outline > div > div");

                if (divs[0] && divs[1]) {
                    let checkbox = divs[0].querySelector("check-box");

                    let should_change = true;
                    if (checkbox) {
                        should_change = !!color;
                        this.SetCheckbox(checkbox, !should_change);
                    }

                    if (should_change) {
                        let picker = divs[1].querySelector("color-picker");
                        this.SetTextValue(picker, color || "FFFFFF");
                    }
                }

                if (divs[2] && divs[3]) {
                    let checkbox = divs[2].querySelector("check-box");

                    let should_change = true;
                    if (checkbox) {
                        should_change = !!outline;
                        this.SetCheckbox(checkbox, !should_change);
                    }

                    if (should_change) {
                        let picker = divs[3].querySelector("color-picker");
                        this.SetTextValue(picker, outline || "000000");
                    }
                }
            }
        },
        SetCheckbox: function(element, value) {
            if (element.tagName == "CHECK-BOX") {
                if (this.IsCheckboxChecked(element) != value) {
                    element.children[0].dispatchEvent(clickEvent);
                }
            }
        },
        GetTextValue: function(element) {
            if (element.tagName == "COLOR-PICKER") {
                return element.querySelector("input").value;
            }
            return element.value;
        },
        SetTextValue: function(element, value) {
            if (element.tagName == "COLOR-PICKER") {
                element = element.querySelector("input");
            }
            element.value = value;
            element.dispatchEvent(inputEvent);
        },
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
        `,
        CSS_RGB_Regex: /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
        InjectedCSSTag: null,
        ChevronStyle: null,
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
                let i = document.createElement("i");
                i.classList.add("fa")
                i.classList.add("fa-fw")
                i.classList.add("fa-chain")
                chain.appendChild(i);
                chain.classList.add("nmw-color-picker-chain");

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
                        i.style.color = "#888";
                    } else if (shade_mimic_colors.r <= 255 && shade_mimic_colors.g <= 255 && shade_mimic_colors.b <= 255) {
                        i.style.color = "#666";
                    } else {
                        i.style.color = "#444";
                        if (i.classList.contains("fa-chain")) {
                            i.classList.remove("fa-chain");
                            i.classList.add("fa-chain-broken");
                        }
                        return;
                    }
                    if (i.classList.contains("fa-chain-broken")) {
                        i.classList.remove("fa-chain-broken");
                        i.classList.add("fa-chain");
                    }
                }

                color_pickers[0].querySelector(".color-picker-box").addEventListener("color-change", main_watch, true);

                // Add on-click and such.
                chain.onclick = function() {
                    let [main, outline] = Utils.GetFillOutlineValues(fill_outline);

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
                        Utils.SetFillOutlineValues(fill_outline, [main, outline]);
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

    window.Injection = Injection;
})(window, document);