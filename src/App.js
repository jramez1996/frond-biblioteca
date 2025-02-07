import React, { useState, useEffect } from 'react';

// Estilos en línea con CSS-in-JS
const estilos = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f7f7f7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: 0,
  },
  formContainer: {
    width: '100%',
    maxWidth: '500px',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  inputField: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
  },
  buttonPrimaryHover: {
    backgroundColor: '#0056b3',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
  },
  buttonSuccessHover: {
    backgroundColor: '#218838',
  },
  clientInfoCard: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '20px',
    borderRadius: '5px',
    marginTop: '20px',
  },
  selectContainer: {
    marginTop: '20px',
  },
  selectField: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginTop: '20px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: '20px',
  },
};

const ReservaFormulario = () => {
  const [documento, setDocumento] = useState('');
  const [idCliente, setIdCliente] = useState(0);
  const [cliente, setCliente] = useState(null);
  const [selectedLibros, setSelectedLibros] = useState([]);
  const [libros, setLibros] = useState([]);
  const [reservaRegistrada, setReservaRegistrada] = useState(false);
  const [fechaDevolucion, setFechaDevolucion] = useState(''); // Estado para la fecha de devolución
  const [mensaje, setMensaje] = useState(''); // Estado para mostrar mensajes de éxito o error

  // Cargar los libros desde la API
  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        const response = await fetch('https://localhost:7112/api/Prestamo/ObtenerLibro');
        const data = await response.json();
        if (data.success) {
          const librosDisponibles = data.data.dataObject.map((libro) => ({
            id: libro.idCopia,
            nombre: libro.titulo,
          }));
          setLibros(librosDisponibles);
        }
      } catch (error) {
        console.error('Error al cargar los libros:', error);
      }
    };
    obtenerLibros();
  }, []);  // El array vacío [] asegura que esto se ejecute solo una vez al montar el componente

  // Función para realizar la búsqueda del cliente
  const buscarCliente = async () => {
    if (documento === '') {
      alert('Por favor ingrese un documento de identidad');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7112/api/Prestamo/buscarCliente/${documento}`);
      const data = await response.json();
      if (data.data.dataObject) {
        const clienteEncontrado = data.data.dataObject[0];
        setIdCliente(clienteEncontrado.id);
        setCliente({
          nombre: `${clienteEncontrado.nombres} ${clienteEncontrado.apellidos}`,
          documento: clienteEncontrado.documento,
        });
      } else {
        alert('No se encontró un cliente con ese documento');
      }
    } catch (error) {
      console.error('Error al buscar el cliente:', error);
      alert('Hubo un problema al buscar el cliente');
    }
  };

  // Función para manejar la selección de libros
  const handleLibroChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    
    if (selectedOptions.length <= 3) {
      setSelectedLibros(selectedOptions);
    } else {
      alert('Solo puedes seleccionar hasta 3 libros');
    }
  };

  // Función para registrar la reserva
  const registrarReserva = async () => {
    if (selectedLibros.length === 0) {
      alert('Por favor seleccione al menos un libro');
      return;
    }
    if (!fechaDevolucion) {
      alert('Por favor seleccione una fecha de devolución');
      return;
    }
    if (!cliente) {
      alert('Por favor busque un cliente');
      return;
    }

    // Datos para la reserva
    const dataReserva = {
      idCliente: idCliente, // ID del cliente
      libros: (selectedLibros.map(libro => libros.find(l => l.nombre === libro).id)), // Convertir los nombres de los libros a sus IDs
      fechaDevolucionEstimada: fechaDevolucion, // Fecha de devolución seleccionada
      usuarioRegistro: 'Usuario de ejemplo', // Cambia esto por el usuario real si es necesario
    };

    try {
      const response = await fetch('https://localhost:7112/api/Prestamo/creacionPrestamo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataReserva),
      });
      const result = await response.json();
      if (result.success) {
        setReservaRegistrada(true);
        setMensaje(`Reserva registrada exitosamente para los libros: ${selectedLibros.join(', ')}. Fecha de devolución: ${fechaDevolucion}`);
      } else {
        setReservaRegistrada(false);
        setMensaje(result.message); // Mostrar el mensaje de error
      }
    } catch (error) {
      console.error('Error al registrar la reserva:', error);
      setReservaRegistrada(false);
      setMensaje('Hubo un problema al registrar la reserva');
    }
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.formContainer}>
        <div style={estilos.card}>
          <h4>Buscar Cliente</h4>
          <input
            type="text"
            placeholder="Ingrese documento de identidad"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            style={estilos.inputField}
          />
          <button
            onClick={buscarCliente}
            style={{ ...estilos.button, ...estilos.buttonPrimary }}
            onMouseOver={(e) => (e.target.style.backgroundColor = estilos.buttonPrimaryHover.backgroundColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = estilos.buttonPrimary.backgroundColor)}
          >
            Buscar Cliente
          </button>

          {cliente && (
            <div style={estilos.clientInfoCard}>
              <h5>Cliente Encontrado:</h5>
              <p><strong>Nombre:</strong> {cliente.nombre}</p>
              <p><strong>Documento:</strong> {cliente.documento}</p>
            </div>
          )}

          {cliente && (
            <>
              <div style={estilos.selectContainer}>
                <select
                  multiple
                  value={selectedLibros}
                  onChange={handleLibroChange}
                  style={estilos.selectField}
                >
                  {libros.map((libro) => (
                    <option key={libro.id} value={libro.nombre}>
                      {libro.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={estilos.selectContainer}>
                <input
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  style={estilos.selectField}
                />
              </div>

              <button
                onClick={registrarReserva}
                style={{ ...estilos.button, ...estilos.buttonSuccess }}
                onMouseOver={(e) => (e.target.style.backgroundColor = estilos.buttonSuccessHover.backgroundColor)}
                onMouseOut={(e) => (e.target.style.backgroundColor = estilos.buttonSuccess.backgroundColor)}
              >
                Registrar Reserva
              </button>
            </>
          )}

          {mensaje && (
            <p style={reservaRegistrada ? estilos.successMessage : estilos.errorMessage}>
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservaFormulario;
