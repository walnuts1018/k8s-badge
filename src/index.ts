import * as k8sClient from './k8s';
import { renderBadge } from './badge';
const fs = require('fs');
const core = require('@actions/core');
const env = process.env

const healthyColor = "#33ca56";
const unhealthyColor = "red";
const warningColor = "yellow";

let client: k8sClient.client;
try {
  const kubeconfigText = env.KUBE_CONFIG;
  if (!kubeconfigText) {
    throw new Error("KUBE_CONFIG is not set");
  }
  client = new k8sClient.client(kubeconfigText);
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
    const k8sStatusText = env.K8S_STATUS_SVG_TEXT || "Kubernetes Status";
    if (k8sStatus.IsK8sSystemHealthy) {
      badges.set(renderBadge(k8sStatusText, "Healthy", healthyColor), "k8sStatus");
    } else {
      badges.set(renderBadge(k8sStatusText, "Unhealthy", unhealthyColor), "k8sStatus");
    }

    const podStatusText = env.POD_STATUS_SVG_TEXT || "Healthy Pods";
    const allPodCount = k8sStatus.HealthyPodCount + k8sStatus.UnhealthyPodCount;
    if (k8sStatus.HealthyPodCount === allPodCount) {
      badges.set(renderBadge(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, healthyColor), "podStatus");
    } else if (k8sStatus.HealthyPodCount / allPodCount >= 3 / 4) {
      badges.set(renderBadge(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, warningColor), "podStatus");
    } else {
      badges.set(renderBadge(podStatusText, `${k8sStatus.HealthyPodCount}/${allPodCount}`, unhealthyColor), "podStatus");
    }

    const nodeStatusText = env.NODE_STATUS_SVG_TEXT || "Healthy Nodes";
    const allNodeCount = k8sStatus.HealthyNodeCount + k8sStatus.UnhealthyNodeCount;
    if (k8sStatus.HealthyNodeCount === allNodeCount) {
      badges.set(renderBadge(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, healthyColor), "nodeStatus");
    } else if (k8sStatus.HealthyNodeCount / allNodeCount >= 0.5) {
      badges.set(renderBadge(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, warningColor), "nodeStatus");
    } else {
      badges.set(renderBadge(nodeStatusText, `${k8sStatus.HealthyNodeCount}/${allNodeCount}`, unhealthyColor), "nodeStatus");
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
  core.setOutput("k8sStatus-SVG-Path", "public/k8sStatus.svg");
  core.setOutput("podStatus-SVG-Path", "public/podStatus.svg");
  core.setOutput("nodeStatus-SVG-Path", "public/nodeStatus.svg");
}

try {
  main();
} catch (e: unknown) {
  if (e instanceof Error) {
    core.setFailed("Failed to create badge: " + e.message);
  }
  process.exit(1);
}
