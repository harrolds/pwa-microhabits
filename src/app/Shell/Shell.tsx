import { Suspense } from 'react';
import { ShellRoot } from './ShellRoot';
import { useNavigation } from '../Navigation/useNavigation';
import { commandToHref, linkTo } from '../Navigation/LinkNavigation';
import { appStore } from '../StateMachine/state';
import { setBottomSheetSnap, setBottomSheetVisibility } from '../StateMachine/actions';

const Shell = () => {
  const { CurrentComponent, current, goTo, routes } = useNavigation();

  return (
    <ShellRoot>
      <section style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {routes.map((route) => {
          const command = linkTo(route.id);
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => goTo(command.to)}
              data-href={commandToHref(command)}
              style={{
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: route.id === current.id ? '#6366f1' : 'transparent',
                color: '#fff',
                padding: '0.35rem 1rem',
              }}
            >
              {route.title}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            appStore.dispatch(setBottomSheetVisibility(true));
            appStore.dispatch(setBottomSheetSnap(0.55));
          }}
          style={{
            borderRadius: '999px',
            border: '1px solid rgba(99,102,241,0.8)',
            background: 'rgba(79, 70, 229, 0.2)',
            color: '#fff',
            padding: '0.35rem 1rem',
          }}
        >
          Planner
        </button>
      </section>
      <Suspense fallback={<p>Loading route…</p>}>
        {CurrentComponent ? <CurrentComponent /> : <p>Preparing view…</p>}
      </Suspense>
    </ShellRoot>
  );
};

export default Shell;

