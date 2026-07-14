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
        className="rounded-lg border border-neutral-300 bg-white px-6 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
