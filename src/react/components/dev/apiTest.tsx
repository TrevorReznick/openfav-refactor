// src/components/BasicApiTest.tsx

import React from 'react';
import { sites } from '@/api/apiClient'

const BasicApiTest = () => {
  const handleTestClick = async () => {
    console.log('🔄 Avvio chiamate api...')

    try {

      const _sites = await sites.getAll(); // Chiama la funzione definita in apiClient
      console.log('✅ Risultato della chiamata:', _sites)
      const _sites_by_id = await sites.getOne(139); // Chiama la funzione definita in apiClient
      console.log('✅ Risultato della chiamata:', _sites_by_id)
    } catch (error) {
      console.error('❌ Errore durante la chiamata:', error)
    }
  }


  return (
    <div>
      <button
        onClick={handleTestClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test getSites
      </button>
    </div>
  );
};

export default BasicApiTest;