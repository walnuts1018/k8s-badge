"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBadge = renderBadge;
const makeBadge = require("badge-maker/lib/make-badge");
const fs = require("fs");
const path = require("path");
const k8sIconURL = fs.readFileSync(path.resolve(__dirname, "./public/k8s.svg"), { encoding: "base64" });
function renderBadge(label, message, messageBackgroundColor) {
    return makeBadge({
        logo: `data:image/svg+xml;base64,${k8sIconURL}`,
        label: label,
        labelColor: "gray",
        message: message,
        color: messageBackgroundColor,
        style: "plastic"
    });
}
