import React from 'react';
import RoomPriceCalculator from './components/RoomPriceCalculator';
import AutoDeposit from './components/AutoDeposit';

function App() {
  return (
    <div className="App">
      <div style={{ padding: '16px' }}>
        <RoomPriceCalculator />
        <div style={{ marginLeft: '12px', marginTop: '16px', width: '326px' }}>
          <AutoDeposit />
        </div>
      </div>
    </div>
  );
}

export default App;




