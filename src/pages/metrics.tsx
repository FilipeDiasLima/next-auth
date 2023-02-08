import { Can } from "@/components/Can";
import { withSSRAuth } from "@/HOC/withSSRAuth";
import { useAuth } from "@/hooks/useAuth";
import { setupAPIClient } from "@/services/api";

export default function Metrics() {
  return (
    <div>
      <h1>METRICS</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list1"],
    roles: ["administrator"],
  }
);
