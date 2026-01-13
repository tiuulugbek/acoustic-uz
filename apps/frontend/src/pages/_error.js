// This file is required by Next.js even in App Router mode
// It's a fallback for error handling when global-error.tsx is not available
// In App Router, global-error.tsx takes precedence, but Next.js still looks for this file

export default function Error({ statusCode }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</h1>
      <p>Please try again later.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

