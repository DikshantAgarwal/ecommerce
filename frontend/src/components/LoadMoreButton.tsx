interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function LoadMoreButton({ onClick, isLoading }: LoadMoreButtonProps) {
  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="h-12 rounded-lg border border-neutral-200 bg-neutral-0 px-8 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
