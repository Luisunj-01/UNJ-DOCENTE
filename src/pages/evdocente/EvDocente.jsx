import { useState, useEffect } from "react";
import { useUsuario } from "../../context/UserContext";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useSemestreActual } from "../../hooks/useSemestreActual";
import DataTable, { createTheme } from "react-data-table-component";



import {
 obtenerEncuestas,
 obtenerResultadoDocente,
 obtenerReportePreguntas
} from "./logica/Log.evaDocente";


createTheme('unjBlanco', {
 text: { primary: '#212529' },
 background: { default: '#ffffff' },
 context: { background: '#ffffff', text: '#212529' },
 divider: { default: '#dee2e6' },
});


function EvDocente() {

  const { usuario } = useUsuario();
  const { semestre: semestreActual } = useSemestreActual('01');

  const [semestre, setSemestre] = useState('');
  const [encuesta, setEncuesta] = useState('');
const [listaEncuestas,setListaEncuestas] = useState([]);
const [tabla,setTabla] = useState([]);
const token = usuario?.codigotokenautenticadorunj;
const [loadingTabla,setLoadingTabla] = useState(false);

const [reportePreguntas,setReportePreguntas] = useState([]);
const [modalOpen,setModalOpen] = useState(false);
const [loadingReporte,setLoadingReporte] = useState(false);
const [cursoSeleccionado,setCursoSeleccionado] = useState(null);



  // Cargar semestre actual
  useEffect(() => {
    if (semestreActual) {
      setSemestre(semestreActual);
    }
  }, [semestreActual]);

  // Cuando SemestreSelect carga lista
  const handleSemestresLoaded = (primerSemestre) => {
    if (primerSemestre && !semestre) {
      setSemestre(primerSemestre);
    }
  };

  // useEffect → Encuestras

useEffect(()=>{

 if(!semestre || !token) return;

 setEncuesta('');
 setTabla([]);

 const cargar = async ()=>{

  const res = await obtenerEncuestas(semestre, token);
  setListaEncuestas(res.datos);

 };

 cargar();

},[semestre, token]);



//useEffect → Tabla resultados

useEffect(()=>{

 if(!encuesta || !token) return;

 const cargar = async ()=>{

 setLoadingTabla(true);

 const res = await obtenerResultadoDocente(
   semestre,
   encuesta,
   usuario.docente.persona,
   token
 );

 setTabla(res.datos);

 setLoadingTabla(false);

};


 cargar();

},[encuesta, token]);

const verReportePreguntas = async (row)=>{
 setCursoSeleccionado(row);
 setModalOpen(true);
 setLoadingReporte(true);

 const res = await obtenerReportePreguntas(
  semestre,
  encuesta,
  row.estructura,
  row.curricula,
  row.curso,
  row.seccion,
  token
 );

 setReportePreguntas(res.datos);
 setLoadingReporte(false);

};





// ⭐ COLUMNAS DATATABLE
const columnas = [
 {
  name:"#",
  selector:(row,index)=> index+1,
  width:"70px"
 },
 {
  name:"Curso",
  selector:row => `${row.curricula} - ${row.curso}`
 },
 {
  name:"Sección",
  selector:row => row.seccion
 },
 {
  name:"Nombre Curso",
  selector:row => row.nombrecurso,
  grow:2
 },
 {
  name:"Matriculados",
  selector:row => row.matriculados,
  right:true
 },
 {
  name:"Rindieron",
  selector:row => row.rindieron,
  right:true
 },
 {
  name:"Resultado",
  selector:row => Number(row.portotal).toFixed(2),
  right:true
 },

 {
 name:"Res. x pregunta",
 cell:(row)=>(
   <button
     className="btn btn-sm btn-outline-primary"
     onClick={()=>verReportePreguntas(row)}
   >
     Ver reporte
   </button>
 ),
 ignoreRowClick:true,
 allowOverflow:true,
 button:true
}

];


const columnasPreguntas = [
 { name:"N°", selector:(row,index)=> index+1, width:"70px" },
 {name:"Pregunta",selector:row => row.descripcionpregunta,grow:3,wrap:true},
 { name:"Total Alumnos", selector:row => row.totalalumnos, right:true },
 { name:"Totalmente Desacuerdo", selector:row => row.p0, right:true },
 { name:"En Desacuerdo", selector:row => row.p1, right:true },
 { name:"Ni de acuerdo ni en desacuerdo", selector:row => row.p2, right:true },
 { name:"De acuerdo", selector:row => row.p3, right:true },
 { name:"Totalmente de acuerdo", selector:row => row.p4, right:true },
 { name:"Resultado", selector:row => Number(row.porcentajepregunta).toFixed(2), right:true },
 { name:"Escala 4", selector:row => Number(row.escala4).toFixed(2), right:true }
];




const encuestaDesc =
 listaEncuestas.find(e => e.encuesta === encuesta)?.descripcion;


 const imprimirReporte = () => {

 const nodo = document.getElementById("tabla-print");

 if(!nodo){
   alert("No hay información para imprimir");
   return;
 }

 const contenido = nodo.innerHTML;

 const ventana = window.open("", "", "width=1200,height=800");

 ventana.document.write(`
 <html>
 <head>
 <title>Reporte Encuesta</title>

 <style>

 body{
   font-family: Arial;
   padding: 25px;
 }

 table{
   width:100%;
   border-collapse:collapse;
 }

 th,td{
   border:1px solid #ccc;
   padding:6px;
   font-size:12px;
 }

 th{
   background:#f2f2f2;
 }

 </style>

 </head>
 <body>

 ${contenido}

 </body>
 </html>
 `);

 ventana.document.close();
 ventana.print();
};




  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-4">
        <div className="containerunj mt-3">

          {/* PANEL */}
          <div className="card shadow-sm">

            {/* HEADER */}
            <div className="card-header bg-white">
              <strong>RESULTADO DE ENCUESTA</strong> <br />
              <strong>Lista de Docentes</strong>
            </div>

            {/* BODY */}
            <div className="card-body">

              <form>

                {/* SEMESTRE */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <label className="form-label mb-0">
                      <strong>Semestre :</strong>
                    </label>
                  </div>

                  <div className="col-md-4">
                    <SemestreSelect
                      value={semestre}
                      onChange={(e) => setSemestre(e.target.value)}
                      name="cboSemestre"
                      onSemestresLoaded={handleSemestresLoaded}
                    />
                  </div>
                </div>

                {/* ENCUESTA */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <label className="form-label mb-0">

                      <strong>Encuesta :</strong>
                    </label>
                  </div>

                  <div className="col-md-6">
                    <select
                    className="form-select"
                    value={encuesta}
                    onChange={(e)=>setEncuesta(e.target.value)}
                    >
                    <option value="">--Seleccione una encuesta--</option>

                    {listaEncuestas.map(e=>(
                    <option key={e.encuesta} value={e.encuesta}>
                    {e.descripcion}
                    </option>
                    ))}

                    </select>

                  </div>
                </div>

              </form>

              {/* LOADING */}
              {loadingTabla && (
              <div className="text-center mt-4">
                <div className="spinner-border text-primary"></div>
                <div>Cargando información...</div>
              </div>
              )}

              {/* TABLA */}
              {!loadingTabla && tabla.length > 0 && (


              <div className="mt-4">



              <DataTable
              columns={columnas}
              data={tabla}
              pagination
              highlightOnHover
              responsive
              dense
              theme="unjBlanco"
              />

              {/* TABLA OCULTA SOLO PARA PRINT */}
               <div style={{display:"none"}}>

                <div id="tabla-print">

                {/* HEADER PARA PRINT */}
                <div style={{marginBottom:"20px"}}>

                <div style={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center"
                }}>

                <div style={{
                display:"flex",
                alignItems:"center",
                gap:"10px"
                }}>
                <img src="/image/logo/logo-sigaunj.svg" style={{height:"40px"}}/>
                <div style={{fontWeight:"bold"}}>
                Universidad Nacional de Jaén
                </div>
                </div>

                <div style={{textAlign:"right", fontSize:"12px"}}>
                <div><b>Usuario:</b> {usuario?.docente?.numerodocumento || ""}</div>
                <div><b>Fecha:</b> {new Date().toLocaleString()}</div>
                </div>

                </div>

                <hr/>

                <div style={{textAlign:"center", marginBottom:"10px"}}>
                <div style={{fontWeight:"bold"}}>
                ENCUESTA {encuesta} — SEMESTRE {semestre}
                </div>

                <div style={{fontStyle:"italic", fontSize:"12px"}}>
                {encuestaDesc || ""}
                </div>
                </div>

                <div style={{fontSize:"13px"}}>
                <b>Curso:</b> {cursoSeleccionado?.nombrecurso || ""} <br/>
                <b>Código:</b> {cursoSeleccionado?.curricula || ""} - {cursoSeleccionado?.curso || ""} <br/>
                <b>Sección:</b> {cursoSeleccionado?.seccion || ""}
                </div>

                </div>

                {/* TABLA HTML NORMAL */}
                <table style={{width:"100%", borderCollapse:"collapse"}}>

                <thead>
                <tr>
                <th>N°</th>
                <th>Pregunta</th>
                <th>Total</th>
                <th>TD</th>
                <th>D</th>
                <th>N</th>
                <th>A</th>
                <th>TA</th>
                <th>Resultado</th>
                <th>Escala 4</th>
                </tr>
                </thead>

                <tbody>

                {reportePreguntas.map((r,i)=>(
                <tr key={i}>
                <td>{i+1}</td>
                <td>{r.descripcionpregunta}</td>
                <td>{r.totalalumnos}</td>
                <td>{r.p0}</td>
                <td>{r.p1}</td>
                <td>{r.p2}</td>
                <td>{r.p3}</td>
                <td>{r.p4}</td>
                <td>{Number(r.porcentajepregunta).toFixed(2)}</td>
                <td>{Number(r.escala4).toFixed(2)}</td>
                </tr>
                ))}

                </tbody>

                </table>

                </div>
                </div>







              </div>

              )}

            </div>
          </div>

        </div>
      </div>

      {modalOpen && (

        <div className="modal fade show d-block" style={{background:"rgba(0,0,0,0.5)"}}>
        <div className="modal-dialog modal-xl">
        <div className="modal-content">


        {/* HEADER MODAL */}
        <div className="modal-header d-flex justify-content-between align-items-center">


          <h5 className="modal-title">
          RESULTADOS POR PREGUNTA
          </h5>

          <div className="d-flex gap-2">

          <button
            className="btn btn-sm"
            style={{
              border:"1px solid #dee2e6",
              color:"#000",
              background:"#fff"
            }}
            onMouseEnter={(e)=>{
              e.target.style.background="#f8f9fa";
            }}
            onMouseLeave={(e)=>{
              e.target.style.background="#fff";
            }}
            onClick={imprimirReporte}
            >
            🖨 Imprimir
            </button>


          <button
          className="btn-close"
          onClick={()=>setModalOpen(false)}
          ></button>

          </div>

          </div>



        {/* BODY MODAL */}
        <div className="modal-body">

        {loadingReporte && (
        <div className="text-center">
        <div className="spinner-border text-primary"></div>
        <p>Cargando reporte...</p>
        </div>
        )}

        {!loadingReporte && (

        <>
          <div id="reporte-imprimir">


          {/* ⭐ HEADER INSTITUCIONAL */}
          {cursoSeleccionado && (

          <div className="mb-3 p-3 border rounded bg-white shadow-sm">

          <div className="row align-items-center">

          {/* LOGO + UNIVERSIDAD */}
          <div className="col-md-4 d-flex align-items-center gap-2">

          <img
          src="/image/logo/logo-sigaunj.svg"
          alt="Logo UNJ"
          style={{height:"38px"}}
          />

          <div style={{fontWeight:600}}>
          Universidad Nacional de Jaén
          </div>

          </div>

          {/* ⭐ CENTRO → ENCUESTA */}
          <div className="col-md-4 text-center">

          <div style={{
          fontWeight:600,
          letterSpacing:"1px",
          fontSize:"0.95rem"
          }}>

          ENCUESTA {encuesta} – SEMESTRE {semestre}

          </div>

          <div className="small fst-italic text-muted">

          {
          listaEncuestas.find(e => e.encuesta === encuesta)?.descripcion
          }

          </div>

          </div>

          {/* ⭐ DERECHA → SESIÓN */}
          <div className="col-md-4 text-end small fst-italic text-muted">

          <div>
          <strong>Usuario:</strong> {usuario?.docente?.numerodocumento}
          </div>

          <div>
          <strong>Fecha:</strong> {new Date().toLocaleString()}
          </div>

          </div>

          </div>

          <hr className="my-2"/>

          {/* ⭐ INFO ACADÉMICA */}
          {cursoSeleccionado && (

          <div style={{fontSize:"0.95rem"}}>

          <strong>Curso:</strong> {cursoSeleccionado.nombrecurso} <br/>
          <strong>Código:</strong> {cursoSeleccionado.curricula} - {cursoSeleccionado.curso} <br/>
          <strong>Sección:</strong> {cursoSeleccionado.seccion}
          </div>

          )}

          </div>

          )}

          {/* ⭐ TABLA */}
          <DataTable
          columns={columnasPreguntas}
          data={reportePreguntas}
          pagination
          dense
          theme="unjBlanco"
          />

          </div>

          


          </>

          )}

          </div>

          </div>
          </div>
          </div>

          )}


        </>
    


      );
    }

export default EvDocente;
