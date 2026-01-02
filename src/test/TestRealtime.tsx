import { usePortfolioRealtime } from '../../hooks/usePortfolioRealtime';
import { useAllocationRealtime } from '../../hooks/useAllocationRealtime';

export function TestRealtime() {
    const { assets, loading: loadingPortfolio } = usePortfolioRealtime('test-user-id');
    const { logs, loading: loadingAllocation } = useAllocationRealtime('test-user-id');

    return (
        <div style={{ padding: '20px' }}>
            <h1>Teste de Realtime</h1>

            <h2>Portfolio Assets</h2>
            <p>Loading: {loadingPortfolio ? 'Sim' : 'Não'}</p>
            <p>Total: {assets.length}</p>

            <h2>Allocation Logs</h2>
            <p>Loading: {loadingAllocation ? 'Sim' : 'Não'}</p>
            <p>Total: {logs.length}</p>
        </div>
    );
}
