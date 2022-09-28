const Loader = ({ children }) => {
  return (
    <div style={{
      border: '5px solid #f2f2f2',
      borderTop: '5px solid #000',
      borderRadius: '50%',
      blockSize: '70px',
      inlineSize: '70px',
      animation: 'spin 900ms linear infinite'
    }}>
      {children}
    </div>
  )
}
export default Loader