import axios from "axios";
import config from "../../../config";

export const obtenerEncuestas = async (semestre, token) => {

 try{

  const res = await axios.get(
   `${config.apiUrl}api/Evadocente/encuestas/${semestre}`,
   {
    headers:{
     Authorization: `Bearer ${token}`
    }
   }
  );

  if(Array.isArray(res.data)){
   return { datos: res.data };
  }

  return { datos: [] };

 }catch(error){
  console.error("Error encuestas:", error);
  return { datos: [] };
 }

};


export const obtenerResultadoDocente = async (semestre,encuesta,persona,token) => {

 try{

  const res = await axios.get(
   `${config.apiUrl}api/Evadocente/encuesta-docente/${semestre}/${encuesta}/${persona}`,
   {
    headers:{
     Authorization: `Bearer ${token}`
    }
   }
  );

  if(Array.isArray(res.data)){
   return { datos: res.data };
  }

  return { datos: [] };

 }catch(error){
  console.error("Error resultados:", error);
  return { datos: [] };
 }

};

export const obtenerReportePreguntas = async (
 semestre,
 encuesta,
 estructura,
 curricula,
 curso,
 seccion,
 token
)=>{
 try{

  const res = await axios.get(
   `${config.apiUrl}api/Evadocente/reporte-preguntas`,
   {
    params:{
     semestre,
     encuesta,
     estructura,
     curricula,
     curso,
     seccion
    },
    headers:{
     Authorization:`Bearer ${token}`
    }
   }
  );

  return { datos: res.data };

 }catch(e){
  console.error(e);
  return { datos: [] };
 }
};




