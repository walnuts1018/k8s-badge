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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const k8s = __importStar(require("@kubernetes/client-node"));
class client {
    config;
    constructor(kubeconfigText) {
        this.config = new k8s.KubeConfig();
        this.config.loadFromString(kubeconfigText);
    }
    async getInfo() {
        const api = this.config.makeApiClient(k8s.CoreV1Api);
        const pods = (await api.listNamespacedPod('')).body.items;
        const healthyPodCount = pods.filter(pod => pod.status?.phase === "Running").length;
        const unhealthyPodCount = pods.filter(pod => pod.status?.phase === "Pending" || pod.status?.phase === "Failed").length;
        const nodes = (await api.listNode()).body.items;
        const healthyNodeCount = nodes.filter(node => node.status?.conditions?.some(condition => condition.type === "Ready" && condition.status === "True")).length;
        const unhealthyNodeCount = nodes.filter(node => node.status?.conditions?.some(condition => condition.type === "Ready" && (condition.status === "False" || condition.status === "Unknown"))).length;
        return {
            IsK8sSystemHealthy: true,
            HealthyPodCount: healthyPodCount,
            UnhealthyPodCount: unhealthyPodCount,
            HealthyNodeCount: healthyNodeCount,
            UnhealthyNodeCount: unhealthyNodeCount,
            CPUUsageCores: 0,
            MemoryUsageMegaBytes: 0,
            CPUAvailableCores: 0,
            MemoryAvailableMegaBytes: 0
        };
    }
}
exports.client = client;
