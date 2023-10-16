"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBadge = void 0;
const makeBadge = require("badge-maker/lib/make-badge");
const k8sIconURL = "https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg";
function renderBadge(label, message, messageBackgroundColor) {
    return makeBadge({
        logo: k8sIconURL,
        label: label,
        labelColor: "gray",
        message: message,
        color: messageBackgroundColor,
        style: "plastic"
    });
}
exports.renderBadge = renderBadge;
