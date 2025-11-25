type PanelProps = {
  onClose: () => void;
};

export const LeftPanel = ({ onClose }: PanelProps) => (
  <aside>
    <h2>Navigation</h2>
    <p>Use the navigation hook to move across views.</p>
    <button type="button" onClick={onClose}>
      Close
    </button>
  </aside>
);

