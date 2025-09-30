import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Tabla Skeleton
export const TablaSkeleton = ({ filas = 5, columnas = 4 }) => (
  <div className="table-responsive mt-4">
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: columnas }).map((_, i) => (
            <th key={i}>
              <Skeleton height={20} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: filas }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columnas }).map((_, colIndex) => (
              <td key={colIndex}>
                <Skeleton height={20} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Combo (Select) Skeleton
export const ComboSkeleton = ({ height = 38, width = '100%' }) => (
  <div className="form-group mt-3">
    <Skeleton height={height} width={width} />
  </div>
);

// Acordeón Skeleton
export const AcordionSkeleton = ({ items  }) => (
  <div className="accordion mt-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="mb-2">
        <Skeleton height={30} width="100%" />
        <Skeleton count={2} height={15} style={{ marginTop: 8 }} />
      </div>
    ))}
  </div>
);

// Tarjeta/Carta Skeleton
export const CardSkeleton = ({ cards = 3 }) => (
  <div className="container mt-3">
    <div className="row">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="col-12 col-sm-6 col-md-4 mb-4">
          <div className="card p-3 h-100">
            <Skeleton height={150} />
            <Skeleton count={3} style={{ marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

