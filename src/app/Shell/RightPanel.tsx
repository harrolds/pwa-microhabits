type PanelProps = {
  onClose: () => void;
};

export const RightPanel = ({ onClose }: PanelProps) => (
  <aside>
    <h2>Quick Actions</h2>
    <p>Attach shortcuts or automation entry points here.</p>
    <button type="button" onClick={onClose}>
      Close
    </button>
  </aside>
);

