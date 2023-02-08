import { Can } from "@/components/Can";
import { withSSRAuth } from "@/HOC/withSSRAuth";
import { useAuth } from "@/hooks/useAuth";
import { setupAPIClient } from "@/services/api";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  return (
    <div>
      <h1>DASHBOARD</h1>
      <h3>{user.email}</h3>
      <button onClick={signOut}>Sair</button>
      <Can permissions={["metrics.list"]}>
        <span>Métricas</span>
      </Can>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  return {
    props: {},
  };
});
