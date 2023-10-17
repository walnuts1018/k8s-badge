import * as k8s from '@kubernetes/client-node';

export class client {
  private config: k8s.KubeConfig;

  constructor(kubeconfigText: string) {
    this.config = new k8s.KubeConfig();
    this.config.loadFromString(kubeconfigText);
  }

  async getInfo(): Promise<k8sStatus> {
    const api = this.config.makeApiClient(k8s.CoreV1Api);
    try {
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
    } catch (e: unknown) {
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
      }
    }
  }
}

export type k8sStatus = {
  IsK8sSystemHealthy: boolean;
  HealthyPodCount: number;
  UnhealthyPodCount: number;
  HealthyNodeCount: number;
  UnhealthyNodeCount: number;
  CPUUsageCores: number;
  MemoryUsageMegaBytes: number;
  CPUAvailableCores: number;
  MemoryAvailableMegaBytes: number;
}
