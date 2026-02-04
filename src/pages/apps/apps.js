// src/pages/apps/apps.jsx
import { useState } from "react";
import { Row, Col, Container, Card, CloseButton, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import "bootstrap-icons/font/bootstrap-icons.css";

import { openExternalApp } from "../../services/ssoService";
import Swal from "sweetalert2";

const Apps = () => {
  const [loadingCode, setLoadingCode] = useState(null); // MOD11, rsu, etc.

  // =====================================================
  // DEFINICIÓN DE APPS / MÓDULOS
  // =====================================================
  const shortcuts = [
    {
      nombre: "Gestión Académica",
      tipo: "internal",
      codigo: "MOD01",
      icono: "bi-mortarboard-fill",
    },
    {
      nombre: "Evaluación Docente",
      tipo: "internal",
      codigo: "MOD03",
      icono: "bi-person-badge-fill",
    },
    {
      nombre: "Gestión Biblioteca",
      tipo: "external",
      codigo: "MOD04",
      icono: "bi-book-half",
      url: "https://biblioteca-intra.unj.edu.pe/"
    },
    {
      nombre: "Escalafón Docente",
      tipo: "external",
      codigo: "MOD05",
      icono: "bi-briefcase-fill",
      url: "https://app.unj.edu.pe/escalafon/#/login"
    },
    {
      nombre: "Pagos Virtuales",
      tipo: "external",
      codigo: "MOD06",
      icono: "bi-cash-stack",
      url: "https://sigaweb2025.unj.edu.pe/zetunajaen/teso01/",
    },
    {
      nombre: "Actividades No Lectivas",
      tipo: "internal",
      codigo: "MOD09",
      icono: "bi-calendar-event-fill",
    },
    {
      nombre: "Documentos Normativos",
      tipo: "internal",
      codigo: "MOD10",
      icono: "bi-file-earmark-text-fill",
    },
    {
      nombre: "RSU",
      tipo: "sso",
      codigo: "MOD11",
      app: "rsu",
      imagen: "/image/apps/rsu2.png",
    },
  ];

  // =====================================================
  // ICONO INTELIGENTE
  // =====================================================
  const AppIcon = ({ op }) => {
    if (op.imagen) {
      return (
        <img
          src={op.imagen}
          alt={op.nombre}
          style={{ width: 38, height: 38, objectFit: "contain", background: '#fff', borderRadius: 8 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
          }}
        />
      );
    }
    if (op.icono) {
      return <i className={`bi ${op.icono}`}></i>;
    }
    return (
      <span style={{ fontWeight: 900, fontSize: "1.6rem", color: "#003a8c" }}>
        {op.nombre.charAt(0)}
      </span>
    );
  };

  // =====================================================
  // CONTENIDO DE LA TARJETA (normal / loading)
  // =====================================================
  const CardContent = ({ op }) => {
    const isLoading = loadingCode === (op.app || op.codigo);

    if (isLoading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
          <div className="unj-icon-contrast mb-3">
            <AppIcon op={op} />
          </div>
          <Spinner animation="border" variant="light" className="mb-2" />
          <span className="fw-bold small">CONECTANDO</span>
          <span className="mt-1" style={{ fontSize: "0.8rem", opacity: 0.9 }}>
            Accediendo a <b>{op.nombre}</b>
          </span>
        </div>
      );
    }

    return (
      <>
        <div className="unj-icon-contrast mb-3">
          <AppIcon op={op} />
        </div>
        <span className="unj-label-contrast">{op.nombre}</span>
      </>
    );
  };

  // =====================================================
  // TARJETA VISUAL
  // =====================================================
  const AppCard = ({ op }) => (
    <div className="unj-card-box">
      <Card
        className={`unj-card-contrast border-0 ${loadingCode === (op.app || op.codigo) ? "opacity-75" : ""
          }`}
      >
        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
          <CardContent op={op} />
        </Card.Body>
      </Card>
    </div>
  );

  // =====================================================
  // HANDLER PARA APPS EXTERNAS / SSO
  // =====================================================
  const handleClickApp = (op) => {
    if (loadingCode) return;

    if (op.tipo === "external") {
      let iconHtml = "";
      if (op.imagen) {
        iconHtml = `<img src="${op.imagen}" alt="logo" style="width:48px;height:48px;margin-bottom:12px;border-radius:8px;background:#fff;" />`;
      } else if (op.icono) {
        iconHtml = `<i class='bi ${op.icono}' style='font-size:2.5rem;color:#003a8c;background:#fff;padding:8px;border-radius:8px;margin-bottom:12px;'></i>`;
      } else {
        iconHtml = `<span style='font-weight:900;font-size:2.5rem;color:#003a8c;background:#fff;padding:8px;border-radius:8px;margin-bottom:12px;'>${op.nombre.charAt(0)}</span>`;
      }
      Swal.fire({
        title: "Redirigiendo…",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
            ${iconHtml}
            Redirigiendo a <b>${op.nombre}</b>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setTimeout(() => {
        Swal.close();
        window.open(op.url, "_blank", "noopener,noreferrer");
      }, 800);
      return;
    }

    if (op.tipo === "sso") {
      setLoadingCode(op.app);
      openExternalApp(op.app, op.imagen).finally(() => {
        setLoadingCode(null);
      });
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <Container
      fluid
      className="cont-app min-vh-100 d-flex flex-column"
      style={{
        background: "linear-gradient(135deg, #0076f5 0%, #00d4ff 100%)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      <div className="position-absolute end-0 top-0 p-4" style={{ zIndex: 1000 }}>
        <div className="unj-close-wrapper shadow">
          <CloseButton variant="light" onClick={() => window.history.back()} />
        </div>
      </div>

      <Container className="my-auto py-5 z-1">
        <header className="text-center mb-5 animate-pop-in">
          <img
            src="/image/logo/logo-sigaunj.svg"
            alt="Apps UNJ"
            style={{
              maxWidth: "260px",
              width: "100%",
              height: "auto",
              marginBottom: "10px",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
            }}
          />
          <p className="text-white opacity-75">
            Plataforma Digital Universitaria
          </p>
        </header>

        <Row className="g-4 justify-content-center">
          {shortcuts.map((op, i) => (
            <Col
              key={i}
              xs={6}
              sm={4}
              md={3}
              lg={2}
              className="d-flex justify-content-center"
            >
              {op.tipo === "internal" ? (
                <Link to={`/apps/${op.codigo}`} style={{ textDecoration: "none" }}>
                  <AppCard op={op} />
                </Link>
              ) : (
                <div
                  onClick={() => handleClickApp(op)}
                  style={{
                    cursor: loadingCode ? "wait" : "pointer",
                    width: "100%",
                    pointerEvents: loadingCode ? "none" : "auto",
                  }}
                >
                  <AppCard op={op} />
                </div>
              )}
            </Col>
          ))}
        </Row>
      </Container>

      {/* ESTILOS (sin cambios importantes) */}
      <style>{`
      /* Decoraciones de fondo */
        .bg-circle-1 {
          position: absolute; width: 400px; height: 400px;
          background: rgba(255,255,255,0.1); border-radius: 50%;
          top: -100px; left: -100px;
        }
        .bg-circle-2 {
          position: absolute; width: 300px; height: 300px;
          background: rgba(0,0,0,0.05); border-radius: 50%;
          bottom: -50px; right: -50px;
        }

        /* Botón Cerrar */
        .unj-close-wrapper {
          background: #003a8c;
          padding: 10px;
          border-radius: 50%;
          border: 2px solid white;
          transition: all 0.3s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .unj-close-wrapper:hover {
          transform: rotate(90deg) scale(1.1);
          background: #ff4d4d;
        }

        /* --- NUEVO DISEÑO DE BOTONES (TARJETAS) --- */
        .unj-card-contrast {
          background: rgba(255, 255, 255, 0.15) !important; /* Tarjeta translúcida */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          width: 150px;
          height: 155px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .unj-icon-contrast {
          width: 60px; height: 60px;
          background: #ffffff; /* FONDO BLANCO SÓLIDO (Contraste alto) */
          color: #0076f5; /* Icono azul */
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem;
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .unj-label-contrast {
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          text-align: center;
          line-height: 1.2;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        /* --- HOVER DEL BOTÓN --- */
        .unj-card-box:hover .unj-card-contrast {
          transform: translateY(-10px);
          background: #ffffff !important; /* SE VUELVE BLANCO SÓLIDO */
          box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
        }

        .unj-card-box:hover .unj-icon-contrast {
          background: #003a8c !important; /* El icono cambia a fondo azul oscuro */
          color: #ffffff !important; /* Icono blanco */
        }

        .unj-card-box:hover .unj-label-contrast {
          color: #003a8c !important; /* Texto azul oscuro sobre fondo blanco */
          text-shadow: none;
        }

        .animate-pop-in {
          animation: popIn 0.8s cubic-bezier(0.26, 0.53, 0.74, 1.48);
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 576px) {
          .unj-card-contrast { width: 140px; height: 140px; }
        }
      `}</style>
    </Container>
  );
};

export default Apps;

