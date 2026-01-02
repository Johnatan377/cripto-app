import { usePortfolioRealtime } from './usePortfolioRealtime';
import { useAllocationRealtime } from './useAllocationRealtime';

// PEGAR O USER_ID DO SUPABASE
const TEST_USER_ID = 'dee4dede-42b4-4b59-97b3-5da6d101874';

export function TestHooks() {
    const {
        assets,
        loading: loadingPortfolio,
        error: errorPortfolio
    } = usePortfolioRealtime(TEST_USER_ID);

    const {
        logs,
        loading: loadingAllocation,
        error: errorAllocation
    } = useAllocationRealtime(TEST_USER_ID);

    return (
        <div style={{
            padding: '40px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            minHeight: '100vh'
        }}>
            <h1>🧪 Teste dos Hooks Realtime</h1>

            <div style={{ marginTop: '30px' }}>
                <h2>📊 Portfolio Assets</h2>
                <p>Loading: {loadingPortfolio ? '⏳ Sim' : '✅ Não'}</p>
                <p>Error: {errorPortfolio || '✅ Nenhum'}</p>
                <p>Total: <strong>{assets.length}</strong> ativos</p>

                {assets.length > 0 && (
                    <pre style={{
                        backgroundColor: '#2a2a2a',
                        padding: '15px',
                        borderRadius: '8px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(assets, null, 2)}
                    </pre>
                )}
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>📝 Allocation Logs</h2>
                <p>Loading: {loadingAllocation ? '⏳ Sim' : '✅ Não'}</p>
                <p>Error: {errorAllocation || '✅ Nenhum'}</p>
                <p>Total: <strong>{logs.length}</strong> logs</p>

                {logs.length > 0 && (
                    <pre style={{
                        backgroundColor: '#2a2a2a',
                        padding: '15px',
                        borderRadius: '8px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(logs, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}