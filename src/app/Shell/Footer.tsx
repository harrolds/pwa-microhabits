type FooterProps = {
  className?: string;
};

export const Footer = ({ className }: FooterProps) => (
  <footer className={className}>
    <small>&copy; {new Date().getFullYear()} PWA Factory Skeleton</small>
  </footer>
);

