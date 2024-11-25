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
exports.client = void 0;
const k8s = __importStar(require("@kubernetes/client-node"));
const timeoutSecond = 120;
class client {
    config;
    constructor(kubeconfigText) {
        this.config = new k8s.KubeConfig();
        this.config.loadFromString(kubeconfigText);
    }
    async getInfo() {
        const api = this.config.makeApiClient(k8s.CoreV1Api);
        try {
            const pods = (await api.listNamespacedPod('', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, timeoutSecond)).body.items;
            const healthyPodCount = pods.filter(pod => pod.status?.phase === "Running").length;
            const unhealthyPodCount = pods.filter(pod => pod.status?.phase === "Pending" || pod.status?.phase === "Failed").length;
            const nodes = (await api.listNode(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, timeoutSecond)).body.items;
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
        catch (e) {
            return {
                IsK8sSystemHealthy: false,
                HealthyPodCount: 0,
                UnhealthyPodCount: 0,
                HealthyNodeCount: 0,
                UnhealthyNodeCount: 0,
                CPUUsageCores: 0,
                MemoryUsageMegaBytes: 0,
                CPUAvailableCores: 0,
                MemoryAvailableMegaBytes: 0
            };
        }
    }
}
exports.client = client;
