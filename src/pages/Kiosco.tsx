import React, { useState } from 'react';
import { digiturnoService } from '../services/api';
import { TurnoResponse, Paciente, Cita } from '../types';
import { PrinterService } from '../services/printerService';
import TicketPrinter from '../components/TicketPrinter';
import './Kiosco.css';

const Kiosco: React.FC = () => {
  const [step, setStep] = useState<'servicio' | 'preferencial-tipo' | 'tipo-documento' | 'documento' | 'confirmacion' | 'exito'>('servicio');
  const [servicioSeleccionado, setServicioSeleccionado] = useState<'preferencial' | 'facturacion' | 'asignacion' | null>(null);
  const [tipoPreferencial, setTipoPreferencial] = useState<'cita' | 'facturacion' | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<'CC' | 'TI' | 'CE' | 'PP' | null>(null);
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [citasPaciente, setCitasPaciente] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [turnoAsignado, setTurnoAsignado] = useState<TurnoResponse | null>(null);

  const seleccionarServicio = (servicio: 'preferencial' | 'facturacion' | 'asignacion') => {
    setServicioSeleccionado(servicio);
    if (servicio === 'preferencial') {
      setStep('preferencial-tipo');
    } else {
      setStep('tipo-documento');
    }
  };

  const seleccionarTipoPreferencial = (tipo: 'cita' | 'facturacion') => {
    setTipoPreferencial(tipo);
    setStep('tipo-documento');
  };

  const seleccionarTipoDocumento = (tipo: 'CC' | 'TI' | 'CE' | 'PP') => {
    setTipoDocumento(tipo);
    setNumeroDocumento(''); // Clear document number on type change
    setPacienteEncontrado(null);
    setCitasPaciente([]);
    setMessage('');
    setStep('documento');
  };

  const buscarPaciente = async () => {
    if (!tipoDocumento) {
      setMessage('Por favor seleccione el tipo de documento');
      return;
    }
    
    if (!numeroDocumento.trim()) {
      setMessage('Por favor ingrese un número de documento');
      return;
    }

    setLoading(true);
    setMessage('');

    // Solo buscar paciente si es facturación (normal o preferencial)
    const esFacturacion = servicioSeleccionado === 'facturacion' || 
                         (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'facturacion');

    if (esFacturacion) {
      try {
        const response = await digiturnoService.buscarPaciente(tipoDocumento!, numeroDocumento);
        setPacienteEncontrado(response.paciente || null);
        
        // Las citas ya vienen en la respuesta del endpoint buscar-paciente
        if (response.citas) {
          setCitasPaciente(response.citas);
          
          if (response.citas.length === 0) {
            setMessage('El paciente no tiene citas programadas para hoy');
            return;
          }
        }

        setStep('confirmacion');
      } catch (error) {
        console.error('Error buscando paciente:', error);
        setMessage('Paciente no encontrado. Verifique el número de documento.');
      } finally {
        setLoading(false);
      }
    } else {
      // Para asignación de cita o preferencial para cita, asignar turno directamente
      await asignarTurnoDirecto();
    }
  };

  const asignarTurnoDirecto = async () => {
    // Función para asignar turno directamente sin buscar paciente
    setLoading(true);
    setMessage('');

    try {
      let turno: TurnoResponse;

      if (servicioSeleccionado === 'asignacion') {
        // Para asignación de cita - usar endpoint específico para asignación
        console.log('🚀 KIOSCO: Asignando turno para ASIGNACIÓN DE CITA');
        turno = await digiturnoService.asignarTurnoAsignacionCita(
          tipoDocumento!,
          numeroDocumento
        );
        
        // Verificar que el turno tenga el módulo correcto
        if (turno && turno.modulo !== 'ASIGNACION_CITA') {
          console.log('⚠️ Advertencia: El turno asignado no tiene el módulo correcto');
          console.log('Módulo actual:', turno.modulo);
          console.log('Módulo esperado: ASIGNACION_CITA');
        }
      } else if (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'cita') {
        // Para preferencial para cita
        const motivoPreferencial = "ADULTO_MAYOR"; // Se puede hacer dinámico más adelante
        turno = await digiturnoService.asignarTurnoPreferencial(
          tipoDocumento!,
          numeroDocumento,
          motivoPreferencial
        );
      } else {
        throw new Error('Tipo de servicio no válido para asignación directa');
      }

      console.log('Turno asignado exitosamente:', turno);
      console.log('Detalles del turno (asignarTurnoDirecto):');
      console.log('- Número:', turno.numero_turno);
      console.log('- Módulo:', turno.modulo);
      console.log('- Servicio seleccionado:', servicioSeleccionado);
      console.log('- Tipo preferencial:', tipoPreferencial);
      
      setTurnoAsignado(turno);
      
      // Mostrar pantalla de éxito INMEDIATAMENTE
      setStep('exito');
      setMessage('¡Turno asignado exitosamente! Imprimiendo ticket...');
      
      // Auto-regresar al inicio después de 5 segundos
      setTimeout(() => {
        reiniciar();
      }, 5000);
      
      // Imprimir automáticamente el ticket EN PARALELO
      console.log('🖨️ Imprimiendo ticket automáticamente...');
      const printerService = new PrinterService();
      printerService.printTicket(turno, servicioSeleccionado || undefined).then((printSuccess) => {
        if (printSuccess) {
          console.log('✅ Ticket impreso exitosamente');
          setMessage('¡Turno asignado e impreso exitosamente!');
        } else {
          console.log('❌ Error al imprimir ticket');
          setMessage('Turno asignado - Por favor tome su ticket');
        }
      }).catch((error) => {
        console.error('Error imprimiendo:', error);
        setMessage('Turno asignado - Ticket en proceso');
      });

    } catch (error) {
      console.error('Error asignando turno:', error);
      setMessage('Error al asignar turno. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const asignarTurno = async () => {
    if (!pacienteEncontrado) {
      setMessage('Faltan datos para asignar el turno');
      return;
    }

    // Validar citas solo para facturación o preferencial para facturación
    if ((servicioSeleccionado === 'facturacion' || 
         (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'facturacion')) && 
        citasPaciente.length === 0) {
      setMessage('El paciente no tiene citas programadas para facturación');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let turno: TurnoResponse;

      if (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'facturacion') {
        // Para turnos preferenciales PARA FACTURACIÓN - usar endpoint de facturación
        console.log('🚀 KIOSCO: Usando fetch directo para preferencial-facturación');
        const primeraCita = citasPaciente[0];
        const requestData = {
          numero_paciente: pacienteEncontrado.numero_paciente,
          id_cita: primeraCita.id_cita,
          modulo: "PREFERENCIAL",
          es_preferencial: true,
          motivo_preferencial: "ADULTO_MAYOR",
          tipo_operador_override: "FACTURADOR"
        };
        
        const response = await fetch('http://localhost:8000/asignar-turno-facturacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        if (!result.success) throw new Error(result.detail);
        turno = result.turno;
        
      } else if (servicioSeleccionado === 'preferencial') {
        // Para turnos preferenciales PARA CITA - usar endpoint preferencial original
        const motivoPreferencial = "ADULTO_MAYOR";
        turno = await digiturnoService.asignarTurnoPreferencial(
          tipoDocumento!,
          numeroDocumento,
          motivoPreferencial
        );
      } else if (servicioSeleccionado === 'facturacion') {
        const primeraCita = citasPaciente[0];
        turno = await digiturnoService.asignarTurnoFacturacion(
          pacienteEncontrado.numero_paciente,
          primeraCita.id_cita
        );
      } else if (servicioSeleccionado === 'asignacion') {
        turno = await digiturnoService.asignarTurnoAsignacionCita(
          tipoDocumento!,
          numeroDocumento
        );
      } else {
        throw new Error('Tipo de servicio no válido');
      }

      console.log('Turno asignado exitosamente:', turno);
      setTurnoAsignado(turno);
      
      // Mostrar pantalla de éxito INMEDIATAMENTE
      setStep('exito');
      setMessage('¡Turno asignado exitosamente! Imprimiendo ticket...');
      
      // Auto-regresar al inicio después de 5 segundos
      setTimeout(() => {
        reiniciar();
      }, 5000);
      
      // Imprimir automáticamente el ticket EN PARALELO
      console.log('🖨️ Imprimiendo ticket automáticamente...');
      const printerService = new PrinterService();
      printerService.printTicket(turno, servicioSeleccionado || undefined).then((printSuccess) => {
        if (printSuccess) {
          console.log('✅ Ticket impreso exitosamente');
          setMessage('¡Turno asignado e impreso exitosamente!');
        } else {
          console.log('❌ Error al imprimir ticket');
          setMessage('Turno asignado - Por favor tome su ticket');
        }
      }).catch((error) => {
        console.error('Error imprimiendo:', error);
        setMessage('Turno asignado - Ticket en proceso');
      });

    } catch (error) {
      console.error('Error asignando turno:', error);
      setMessage('Error al asignar turno. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setStep('servicio');
    setServicioSeleccionado(null);
    setTipoPreferencial(null);
    setTipoDocumento(null);
    setNumeroDocumento('');
    setPacienteEncontrado(null);
    setCitasPaciente([]);
    setMessage('');
    setTurnoAsignado(null);
  };

  const volverAServicio = () => {
    setStep('servicio');
    setServicioSeleccionado(null);
    setTipoPreferencial(null);
    setTipoDocumento(null);
    setNumeroDocumento('');
    setPacienteEncontrado(null);
    setCitasPaciente([]);
    setMessage('');
  };

  const getServicioInfo = () => {
    switch (servicioSeleccionado) {
      case 'preferencial':
        const tipoTexto = tipoPreferencial === 'facturacion' ? 'para Facturación' : 
                         tipoPreferencial === 'cita' ? 'para Cita' : '';
        return {
          titulo: `Turno Preferencial ${tipoTexto}`,
          descripcion: 'Atención prioritaria para personas con necesidades especiales',
          icono: '👴'
        };
      case 'facturacion':
        return {
          titulo: 'Facturación',
          descripcion: 'Pago y facturación de servicios médicos',
          icono: '💰'
        };
      case 'asignacion':
        return {
          titulo: 'Asignación de Cita',
          descripcion: 'Programar nueva cita médica',
          icono: '📅'
        };
      default:
        return { titulo: '', descripcion: '', icono: '' };
    }
  };

  return (
    <div className="kiosco-container">
      <div className="kiosco-header">
        
        <h1>Sistema de Turnos Digital</h1>
    
      </div>

      <div className="kiosco-content">
                 {/* Step Indicator */}
         <div className="step-indicator">
           <div className={`step ${step === 'servicio' ? 'active' : ''}`}>1</div>
           <div className={`step ${step === 'preferencial-tipo' ? 'active' : ''}`}>2</div>
           <div className={`step ${step === 'tipo-documento' ? 'active' : ''}`}>3</div>
           <div className={`step ${step === 'documento' ? 'active' : ''}`}>4</div>
           <div className={`step ${step === 'confirmacion' ? 'active' : ''}`}>5</div>
           <div className={`step ${step === 'exito' ? 'active' : ''}`}>6</div>
         </div>

        {/* Step 1: Service Selection */}
        {step === 'servicio' && (
          <div className="step-content">
                         <div className="step-header">
               <div className="header-content">
                 <img src="/images/logoneuro.jpeg" alt="NeuroDX" className="service-logo" />
                 <p>Elija el tipo de atención que necesita</p>
               </div>
             </div>

            <div className="servicios-grid">
              <div
                className="servicio-option"
                onClick={() => seleccionarServicio('preferencial')}
              >
                <div className="servicio-icon">👴</div>
                <div className="servicio-info">
                  <h3>Preferencial</h3>
                  <p>Turno prioritario para personas con necesidades especiales</p>
                </div>
              </div>

              <div
                className="servicio-option"
                onClick={() => seleccionarServicio('facturacion')}
              >
                <div className="servicio-icon">💰</div>
                <div className="servicio-info">
                  <h3>Facturación</h3>
                  <p>Pago y facturación de servicios médicos</p>
                </div>
              </div>

              <div
                className="servicio-option"
                onClick={() => seleccionarServicio('asignacion')}
              >
                <div className="servicio-icon">📅</div>
                <div className="servicio-info">
                  <h3>Asignación de Cita</h3>
                  <p>Programar nueva cita médica</p>
                </div>
              </div>
            </div>
          </div>
                 )}

         {/* Step 2: Preferencial Type Selection */}
         {step === 'preferencial-tipo' && (
           <div className="step-content">
             <div className="step-header">
               <h2>👴 Turno Preferencial</h2>
               <p>¿Para qué tipo de servicio necesita el turno preferencial?</p>
             </div>

             <div className="servicios-grid">
               <div
                 className="servicio-option"
                 onClick={() => seleccionarTipoPreferencial('facturacion')}
               >
                 <div className="servicio-icon">💰</div>
                 <div className="servicio-info">
                   <h3>Facturación</h3>
                   <p>Pago y facturación de servicios médicos</p>
                 </div>
               </div>

               <div
                 className="servicio-option"
                 onClick={() => seleccionarTipoPreferencial('cita')}
               >
                 <div className="servicio-icon">📅</div>
                 <div className="servicio-info">
                   <h3>Cita</h3>
                   <p>Programar nueva cita médica</p>
                 </div>
               </div>
             </div>

                           <div className="button-group">
               <button className="btn-volver" onClick={volverAServicio}>
                 ← Volver a Servicios
               </button>
             </div>
           </div>
         )}

                                       {/* Step 3: Document Type Selection */}
           {step === 'tipo-documento' && (
             <div className="step-content">
               <div className="step-header">
                 <h2>📋 Tipo de Documento</h2>
                 <p>Servicio: {getServicioInfo().titulo}</p>
               </div>

               <div className="documento-section">
                 <div className="input-group">
                   <label htmlFor="tipoDocumento">Seleccione el tipo de documento:</label>
                   <select
                     id="tipoDocumento"
                     value={tipoDocumento || ''}
                     onChange={(e) => {
                       const selectedType = e.target.value as 'CC' | 'TI' | 'CE' | 'PP';
                       if (selectedType) {
                         seleccionarTipoDocumento(selectedType);
                       } else {
                         setTipoDocumento(null);
                       }
                     }}
                     className="select-field"
                   >
                     <option value="">Seleccione una opción</option>
                     <option value="CC">🆔 Cédula de Ciudadanía</option>
                     <option value="TI">👶 Tarjeta de Identidad</option>
                     <option value="CE">🌍 Cédula de Extranjería</option>
                     <option value="PP">✈️ Pasaporte</option>
                   </select>
                 </div>

                                   <div className="button-group">
                   <button className="btn-volver" onClick={volverAServicio}>
                     ← Volver a Servicios
                   </button>
                 </div>
               </div>
             </div>
           )}

         {/* Step 4: Document Entry */}
        {step === 'documento' && (
          <div className="step-content">
                         <div className="step-header">
               <h2>📝 Ingrese su Documento</h2>
               <p>Servicio: {getServicioInfo().titulo}</p>
               <p>Tipo de Documento: {tipoDocumento}</p>
                               {(servicioSeleccionado === 'asignacion' || 
                  (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'cita')) && (
                  <p className="info-text">💡 Para este servicio no es necesario estar registrado</p>
                )}
             </div>

                         <div className="documento-section">
               <div className="input-group">
                 <label htmlFor="numeroDocumento">Número de Documento:</label>
                 <div className="documento-display">
                   <input
                     type="text"
                     id="numeroDocumento"
                     value={numeroDocumento}
                     onChange={(e) => setNumeroDocumento(e.target.value)}
                     placeholder="Ingrese su documento"
                     className="input-field"
                     readOnly
                     autoFocus
                   />
                 </div>
               </div>

               {/* Teclado Numérico */}
               <div className="numeric-keypad">
                 <div className="keypad-row">
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '1')}>1</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '2')}>2</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '3')}>3</button>
                 </div>
                 <div className="keypad-row">
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '4')}>4</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '5')}>5</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '6')}>6</button>
                 </div>
                 <div className="keypad-row">
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '7')}>7</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '8')}>8</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '9')}>9</button>
                 </div>
                 <div className="keypad-row">
                   <button className="keypad-btn clear-btn" onClick={() => setNumeroDocumento('')}>CLEAR</button>
                   <button className="keypad-btn" onClick={() => setNumeroDocumento(numeroDocumento + '0')}>0</button>
                   <button className="keypad-btn backspace-btn" onClick={() => setNumeroDocumento(numeroDocumento.slice(0, -1))}>⌫</button>
                 </div>
               </div>

                                             <div className="button-group">
                                   <button
                    className="btn-buscar"
                    onClick={buscarPaciente}
                    disabled={loading}
                  >
                    {loading ? '🔍 Buscando...' : 
                     (servicioSeleccionado === 'asignacion' || 
                      (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'cita')) 
                     ? '📅 Asignar Turno' : '🔍 Buscar Paciente'}
                  </button>
                 <button className="btn-volver" onClick={() => setStep('tipo-documento')}>
                   ← Volver a Tipo de Documento
                 </button>
               </div>

              {message && (
                <div className="message">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmacion' && (
          <div className="step-content">
            <div className="step-header">
              <h2>✅ Confirmar Información</h2>
              <p>Servicio: {getServicioInfo().titulo}</p>
            </div>

            <div className="confirmacion-section">
              <div className="paciente-info">
                <h3>Información del Paciente:</h3>
                <p><strong>Nombre:</strong> {pacienteEncontrado?.nombre1} {pacienteEncontrado?.apellido1}</p>
                <p><strong>Documento:</strong> {pacienteEncontrado?.id_paciente}</p>
                <p><strong>Servicio:</strong> {getServicioInfo().titulo}</p>
              </div>

                             {(servicioSeleccionado === 'facturacion' || 
                 (servicioSeleccionado === 'preferencial' && tipoPreferencial === 'facturacion')) && 
                citasPaciente.length > 0 && (
                 <div className="citas-info">
                   <h3>Citas Programadas:</h3>
                   {citasPaciente.map((cita, index) => (
                     <div key={index} className="cita-item">
                       <p><strong>Cita {index + 1}:</strong> {cita.fecha_cita} - {cita.hora_cita}</p>
                       <p><strong>Procedimiento:</strong> {cita.procedimiento}</p>
                     </div>
                   ))}
                 </div>
               )}

                             <div className="button-group">
                <button
                  className="btn-confirmar"
                  onClick={asignarTurno}
                  disabled={loading}
                >
                  {loading ? 'Asignando Turno...' : 'Confirmar y Asignar Turno'}
                </button>
                <button className="btn-volver" onClick={() => setStep('documento')}>
                  ← Volver a Documento
                </button>
              </div>

              {message && (
                <div className="message">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'exito' && (
          <div className="step-content">
            <div className="exito-section">
              <div className="exito-icon">✅</div>
              <h2>¡Turno Asignado Exitosamente!</h2>
              <div className="turno-info">
                <h3 style={{fontSize: '2.5rem', color: '#000000', fontWeight: 'bold'}}>Turno #{turnoAsignado?.numero_turno}</h3>
                <p><strong>Servicio:</strong> {getServicioInfo().titulo}</p>
                <p><strong>Paciente:</strong> {pacienteEncontrado?.nombre1} {pacienteEncontrado?.apellido1}</p>
              </div>
              {message && (
                <div className="message success">
                  {message}
                </div>
              )}
              <p className="instrucciones" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>
                🖨️ Ticket impreso - Por favor tome su ticket<br/>
                Espere ser llamado en la pantalla de {getServicioInfo().titulo}
              </p>
              <p style={{fontSize: '1rem', color: '#7f8c8d', marginTop: '20px'}}>
                ⏰ Regresando al inicio automáticamente en 5 segundos...
              </p>
              <button className="btn-nuevo" onClick={reiniciar} style={{marginTop: '10px'}}>
                🔄 Nuevo Turno Ahora
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Printer Modal - Removed for automatic printing */}
    </div>
  );
};

export default Kiosco; 