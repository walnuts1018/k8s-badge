"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const k8sClient = __importStar(require("./k8s"));
const badge_1 = require("./badge");
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const env = process.env;
const healthyColor = "#33ca56";
const unhealthyColor = "red";
const warningColor = "yellow";
let client;
try {
    const kubeconfigText = env.KUBE_CONFIG || fs.readFileSync(path.resolve("C:\\Users\\juglans\\.kube\\config"), { encoding: "utf-8" });
    if (!kubeconfigText) {
        throw new Error("KUBE_CONFIG is not set");
    }
    client = new k8sClient.client(kubeconfigText);
}
catch (e) {
    if (e instanceof Error) {
        core.setFailed("Failed to create k8s client: " + e.message);
    }
    process.exit(1);
}
let k8sStatus;
async function getk8sInfo() {
    k8sStatus = await client.getInfo();
    console.log(k8sStatus);
}
const badges = new Map();
function renderSVG() {
    if (k8sStatus) {
        const k8sStatusText = env.K8S_STATUS_SVG_TEXT || "Kubernetes Status";
        if (k8sStatus.IsK8sSystemHealthy) {
            badges.set((0, badge_1.renderBadge)(k8sStatusText, "Healthy", healthyColor), "k8sStatus");
        }
        else {
            badges.set((0, badge_1.renderBadge)(k8sStatusText, "Unhealthy", unhealthyColor), "k8sStatus");
        }
        const podStatusText = env.POD_STATUS_SVG_TEXT || "Healthy Pods";
        const allPodCount = k8sStatus.HealthyPodCount + k8sStatus.UnhealthyPodCount;
        if (allPodCount === 0) {
            badges.set((0, badge_1.renderBadge)(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, unhealthyColor), "podStatus");
        }
        else if (k8sStatus.HealthyPodCount === allPodCount) {
            badges.set((0, badge_1.renderBadge)(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, healthyColor), "podStatus");
        }
        else if (k8sStatus.HealthyPodCount / allPodCount >= 3 / 4) {
            badges.set((0, badge_1.renderBadge)(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, warningColor), "podStatus");
        }
        else {
            badges.set((0, badge_1.renderBadge)(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, unhealthyColor), "podStatus");
        }
        const nodeStatusText = env.NODE_STATUS_SVG_TEXT || "Healthy Nodes";
        const allNodeCount = k8sStatus.HealthyNodeCount + k8sStatus.UnhealthyNodeCount;
        if (allNodeCount === 0) {
            badges.set((0, badge_1.renderBadge)(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, unhealthyColor), "nodeStatus");
        }
        else if (k8sStatus.HealthyNodeCount === allNodeCount) {
            badges.set((0, badge_1.renderBadge)(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, healthyColor), "nodeStatus");
        }
        else if (k8sStatus.HealthyNodeCount / allNodeCount >= 0.5) {
            badges.set((0, badge_1.renderBadge)(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, warningColor), "nodeStatus");
        }
        else {
            badges.set((0, badge_1.renderBadge)(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, unhealthyColor), "nodeStatus");
        }
    }
}
async function main() {
    console.log("Getting k8s info...");
    await getk8sInfo();
    console.log("Done.");
    console.log("Rendering SVG...");
    renderSVG();
    console.log("Done.");
    console.log("Saving SVG...");
    for (const [svg, name] of badges) {
        fs.writeFileSync(`public/${name}.svg`, svg);
    }
    console.log("Done.");
    core.setOutput("k8sStatus-SVG-Path", path.resolve(__dirname, "./public/k8sStatus.svg"));
    core.setOutput("podStatus-SVG-Path", path.resolve(__dirname, "./public/podStatus.svg"));
    core.setOutput("nodeStatus-SVG-Path", path.resolve(__dirname, "./public/nodeStatus.svg"));
}
try {
    main();
}
catch (e) {
    if (e instanceof Error) {
        core.setFailed("Failed to create badge: " + e.message);
    }
    process.exit(1);
}
