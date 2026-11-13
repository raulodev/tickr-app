import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad | Tickr",
  description:
    "Conoce qué información trata Tickr, para qué la utiliza y cómo solicitar la eliminación de tu cuenta.",
};

export default function Privacy() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 font-(family-name:--font-geist-sans) sm:py-16">
      <header className="mb-12 flex items-center justify-between border-b border-border pb-5">
        <Link href="/login" className="text-lg font-semibold tracking-tight">
          Tickr
        </Link>
        <Link
          href="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Iniciar sesión
        </Link>
      </header>

      <article className="space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Información legal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Política de privacidad
          </h1>
          <p className="text-sm text-muted-foreground">
            Última actualización: 13 de noviembre de 2026
          </p>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            Esta política explica cómo Tickr trata la información necesaria para
            ofrecer el servicio de seguimiento de proyectos e incidencias.
          </p>
        </header>

        <section aria-labelledby="responsable" className="space-y-3">
          <h2 id="responsable" className="text-xl font-semibold">
            Responsable del tratamiento
          </h2>
          <p className="leading-7 text-muted-foreground">
            Tickr es operado por Raúl Cobiellas, en Cuba. Para consultas sobre
            privacidad o solicitudes relacionadas con tus datos, escribe a{" "}
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href="mailto:raulodev@gmail.com"
            >
              raulodev@gmail.com
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="datos" className="space-y-3">
          <h2 id="datos" className="text-xl font-semibold">
            Información que tratamos
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7 text-muted-foreground">
            <li>
              Datos de cuenta: correo electrónico, nombre si lo proporcionas,
              contraseña almacenada mediante un hash y estado de verificación
              del correo.
            </li>
            <li>
              Datos de trabajo: organizaciones, membresías y roles, proyectos,
              incidencias, descripciones, comentarios, asignaciones e historial
              de cambios que se crean en Tickr.
            </li>
            <li>
              Datos técnicos de autenticación necesarios para iniciar y cerrar
              sesiones, verificar el correo y recuperar la contraseña.
            </li>
          </ul>
        </section>

        <section aria-labelledby="uso" className="space-y-3">
          <h2 id="uso" className="text-xl font-semibold">
            Cómo utilizamos la información
          </h2>
          <p className="leading-7 text-muted-foreground">
            Utilizamos estos datos para crear y proteger cuentas, permitir la
            colaboración dentro de las organizaciones, enviar mensajes de
            verificación y recuperación, y mantener el funcionamiento y la
            seguridad del servicio. No vendemos datos personales ni los usamos
            para publicidad personalizada.
          </p>
        </section>

        <section aria-labelledby="alojamiento" className="space-y-3">
          <h2 id="alojamiento" className="text-xl font-semibold">
            Alojamiento y servicios externos
          </h2>
          <p className="leading-7 text-muted-foreground">
            La aplicación y su base de datos se alojan en un VPS administrado
            por Tickr. El centro de datos puede estar en una ubicación distinta
            a la del operador, según el proveedor de infraestructura utilizado.
          </p>
          <p className="leading-7 text-muted-foreground">
            Tickr no utiliza actualmente herramientas externas de analítica ni
            publicidad. La aplicación puede configurarse para enviar mensajes de
            verificación y recuperación mediante un servicio de correo; si se
            habilita un proveedor externo, este recibirá los datos mínimos
            necesarios para entregar esos mensajes y esta política se
            actualizará para identificarlo.
          </p>
        </section>

        <section aria-labelledby="cookies" className="space-y-3">
          <h2 id="cookies" className="text-xl font-semibold">
            Cookies y almacenamiento local
          </h2>
          <p className="leading-7 text-muted-foreground">
            Tickr utiliza cookies de sesión protegidas para mantener la
            autenticación. No utiliza cookies publicitarias ni de seguimiento
            analítico. El navegador puede guardar preferencias de presentación,
            como el tema elegido.
          </p>
        </section>

        <section aria-labelledby="conservacion" className="space-y-3">
          <h2 id="conservacion" className="text-xl font-semibold">
            Conservación y eliminación de la cuenta
          </h2>
          <p className="leading-7 text-muted-foreground">
            Conservamos la información de la cuenta mientras esté activa. Puedes
            solicitar su eliminación desde{" "}
            <Link
              className="font-medium text-foreground underline underline-offset-4"
              href="/dashboard/account"
            >
              Administrar cuenta
            </Link>{" "}
            o escribir al correo de contacto. Al completar la solicitud,
            sustituimos el correo por un identificador aleatorio, borramos el
            nombre, invalidamos las credenciales y sesiones, y quitamos sus
            membresías y asignaciones.
          </p>
          <p className="leading-7 text-muted-foreground">
            Las incidencias, comentarios y eventos creados por esa cuenta se
            conservan dentro de la organización para no romper su historial,
            pero quedan asociados a una identidad anonimizada. Si eres la única
            persona administradora de una organización, primero será necesario
            transferir ese rol.
          </p>
          <p className="leading-7 text-muted-foreground">
            Las copias de seguridad, si existen, pueden conservar datos previos
            hasta que sean reemplazadas conforme a la rotación configurada en el
            servidor.
          </p>
        </section>

        <section aria-labelledby="seguridad" className="space-y-3">
          <h2 id="seguridad" className="text-xl font-semibold">
            Seguridad
          </h2>
          <p className="leading-7 text-muted-foreground">
            Aplicamos medidas técnicas para proteger la información, entre ellas
            el almacenamiento de contraseñas mediante hash, controles de acceso
            por organización y sesiones protegidas. Ningún sistema de
            transmisión o almacenamiento puede garantizar seguridad absoluta.
          </p>
        </section>

        <section aria-labelledby="derechos" className="space-y-3">
          <h2 id="derechos" className="text-xl font-semibold">
            Tus solicitudes y cambios a esta política
          </h2>
          <p className="leading-7 text-muted-foreground">
            Puedes solicitar acceso, corrección o eliminación de tus datos y
            ejercer los demás derechos que reconozca la normativa aplicable.
            Escríbenos a{" "}
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href="mailto:raulodev@gmail.com"
            >
              raulodev@gmail.com
            </a>
            . Actualizaremos esta página cuando cambien las prácticas de
            tratamiento; la fecha al inicio indica la revisión más reciente.
          </p>
        </section>
      </article>

      <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-4">
          Ir a iniciar sesión
        </Link>
      </footer>
    </main>
  );
}
