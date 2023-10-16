import * as k8sClient from './k8s';
import { renderBadge } from './badge';
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');

const healthyColor = "#33ca56";
const unhealthyColor = "red";
const warningColor = "yellow";

let client: k8sClient.client;
try {
  const kubeconfigPath = core.getInput('kubeconfig-path');
  client = new k8sClient.client(kubeconfigPath);
} catch (e: unknown) {
  if (e instanceof Error) {
    core.setFailed("Failed to create k8s client: " + e.message);
  }
  process.exit(1);
}

let k8sStatus: k8sClient.k8sStatus | undefined;
async function getk8sInfo() {
  k8sStatus = await client.getInfo();
  console.log(k8sStatus);
}

const badges = new Map<string, string>();
function renderSVG() {
  if (k8sStatus) {
    if (k8sStatus.IsK8sSystemHealthy) {
      badges.set(renderBadge("Kubernetes System", "healthy", healthyColor), "k8sStatus");
    } else {
      badges.set(renderBadge("Kubernetes System", "unhealthy", unhealthyColor), "k8sStatus");
    }

    const allPodCount = k8sStatus.HealthyPodCount + k8sStatus.UnhealthyPodCount;
    if (k8sStatus.HealthyPodCount === allPodCount) {
      badges.set(renderBadge("Healthy Pods", `${k8sStatus.HealthyPodCount}/${allPodCount}`, healthyColor), "podStatus");
    } else if (k8sStatus.HealthyPodCount / allPodCount >= 3 / 4) {
      badges.set(renderBadge("Healthy Pods", `${k8sStatus.HealthyPodCount}/${allPodCount}`, warningColor), "podStatus");
    } else {
      badges.set(renderBadge("Healthy Pods", `${k8sStatus.HealthyPodCount}/${allPodCount}`, unhealthyColor), "podStatus");
    }

    const allNodeCount = k8sStatus.HealthyNodeCount + k8sStatus.UnhealthyNodeCount;
    if (k8sStatus.HealthyNodeCount === allNodeCount) {
      badges.set(renderBadge("Healthy Nodes", `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, healthyColor), "nodeStatus");
    } else if (k8sStatus.HealthyNodeCount / allNodeCount >= 0.5) {
      badges.set(renderBadge("Healthy Nodes", `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, warningColor), "nodeStatus");
    } else {
      badges.set(renderBadge("Healthy Nodes", `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, unhealthyColor), "nodeStatus");
    }
  }
}

try {
  (async function () {
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
    core.setOutput("k8sStatus-SVG-Path", "public/k8sStatus.svg");
    core.setOutput("podStatus-SVG-Path", "public/podStatus.svg");
    core.setOutput("nodeStatus-SVG-Path", "public/nodeStatus.svg");
  });
} catch (e: unknown) {
  if (e instanceof Error) {
    core.setFailed("Failed to create badge: " + e.message);
  }
  process.exit(1);
}
