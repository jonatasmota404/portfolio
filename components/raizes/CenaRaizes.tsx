"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTema } from "@/context/TemaContext";
import { PALETAS } from "@/lib/paletas";
import type { NoRepo } from "@/lib/raizes";

interface Props {
  nos: NoRepo[];
  ligacoes: Array<{ a: string; b: string; forte: boolean }>;
  calendario: number[];
}

type CircuitBreaker = {
  id: string;
  fase: "aberto" | "meio-aberto" | "normal";
  tempo: number;
};

export function CenaRaizes({ nos, ligacoes, calendario }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tema } = useTema();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materiaisRef = useRef<Map<string, THREE.Material>>(new Map());
  const circuitBreakerRef = useRef<Map<string, CircuitBreaker>>(new Map());
  const tempoAberturaRef = useRef(0);
  const tempoAnimacaoRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Inicializar Three.js
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 30, 50);
    camera.lookAt(0, 0, 0);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const paleta = PALETAS[tema].scene;

    // Criar nós
    const nosGroup = new THREE.Group();
    const nosPorId = new Map<string, THREE.Group>();

    for (const no of nos) {
      const grupo = new THREE.Group();

      // Posição derivada do nome (determinística)
      const angleH = (Math.PI * 2 * (no.hue / 360)) * 2;
      const angleV = Math.sin((no.hue / 360) * Math.PI * 2) * 0.3;
      const r = 20 + (no.commits / Math.max(...nos.map((n) => n.commits))) * 20;
      const x = Math.cos(angleH) * r * Math.cos(angleV);
      const y = Math.sin(angleV) * r * 10;
      const z = Math.sin(angleH) * r * Math.cos(angleV);

      grupo.position.set(x, y, z);

      // Tamanho do nó
      const escala = no.destaque ? 1 : 0.5;
      const tamanhoNucleo = escala * 0.8;

      // Núcleo (esfera)
      const geoNucleo = new THREE.SphereGeometry(tamanhoNucleo, 16, 16);
      const matNucleo = new THREE.MeshStandardMaterial({
        color: new THREE.Color(paleta.core),
        emissive: new THREE.Color(paleta.core),
        emissiveIntensity: 0.5,
      });
      const meshNucleo = new THREE.Mesh(geoNucleo, matNucleo);
      grupo.add(meshNucleo);
      materiaisRef.current.set(`nucleo-${no.id}`, matNucleo);

      // Halo (sprite aditivo)
      const canvas2D = document.createElement("canvas");
      canvas2D.width = 128;
      canvas2D.height = 128;
      const ctx = canvas2D.getContext("2d")!;
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      const texHalo = new THREE.CanvasTexture(canvas2D);
      const matHalo = new THREE.SpriteMaterial({
        map: texHalo,
        sizeAttenuation: true,
        color: new THREE.Color(paleta.halo),
      });
      const halo = new THREE.Sprite(matHalo);
      halo.scale.set(tamanhoNucleo * 4, tamanhoNucleo * 4, 1);
      grupo.add(halo);
      materiaisRef.current.set(`halo-${no.id}`, matHalo);

      nosGroup.add(grupo);
      nosPorId.set(no.id, grupo);
    }
    scene.add(nosGroup);

    // Criar filamentos
    const filamentosGroup = new THREE.Group();
    for (const ligacao of ligacoes) {
      const noA = nosPorId.get(ligacao.a);
      const noB = nosPorId.get(ligacao.b);
      if (!noA || !noB) continue;

      const espessura = ligacao.forte ? 0.15 : 0.08;
      const cor = ligacao.forte ? paleta.filament : paleta.secondary;

      // Linha principal
      const pontos = [noA.position, noB.position];
      const geoLinha = new THREE.BufferGeometry().setFromPoints(pontos);
      const matLinha = new THREE.LineBasicMaterial({
        color: new THREE.Color(cor),
        linewidth: espessura,
      });
      const linha = new THREE.Line(geoLinha, matLinha);
      filamentosGroup.add(linha);
      materiaisRef.current.set(`filamento-${ligacao.a}-${ligacao.b}`, matLinha);

      // Ramificações (2-3 galhos procedurais)
      const numRamificacoes = Math.random() < 0.7 ? 2 : 3;
      for (let i = 0; i < numRamificacoes; i++) {
        const t = Math.random();
        const meio = new THREE.Vector3().addVectors(
          noA.position,
          noB.position.clone().sub(noA.position).multiplyScalar(t)
        );
        const direcao = noB.position
          .clone()
          .sub(noA.position)
          .normalize();
        const perpendicular = new THREE.Vector3(-direcao.z, 0, direcao.x);
        const offset = perpendicular.multiplyScalar((Math.random() - 0.5) * 8);
        const fim = meio.clone().add(offset).add(new THREE.Vector3(0, -5, 0));

        const pontosRam = [meio, fim];
        const geoRam = new THREE.BufferGeometry().setFromPoints(pontosRam);
        const matRam = new THREE.LineBasicMaterial({
          color: new THREE.Color(cor),
          transparent: true,
          opacity: 0.6,
          linewidth: espessura * 0.6,
        });
        const linhaRam = new THREE.Line(geoRam, matRam);
        filamentosGroup.add(linhaRam);
      }
    }
    scene.add(filamentosGroup);

    // Calendário (juncos de fundo)
    const calendarioGroup = new THREE.Group();
    const diasPorLinha = Math.ceil(Math.sqrt(calendario.length));
    const espacamento = 1;
    for (let i = 0; i < calendario.length; i++) {
      const x = (i % diasPorLinha) * espacamento - (diasPorLinha * espacamento) / 2;
      const z = Math.floor(i / diasPorLinha) * espacamento - 30;
      const altura = Math.min(5, calendario[i] * 0.5);

      if (altura > 0) {
        const geoJunco = new THREE.CylinderGeometry(0.08, 0.08, altura, 4);
        const matJunco = new THREE.MeshStandardMaterial({
          color: new THREE.Color(paleta.bokeh),
          emissive: new THREE.Color(paleta.bokeh),
          emissiveIntensity: 0.2,
        });
        const meshJunco = new THREE.Mesh(geoJunco, matJunco);
        meshJunco.position.set(x, altura / 2 - 25, z);
        calendarioGroup.add(meshJunco);
      }
    }
    scene.add(calendarioGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(30, 50, 30);
    scene.add(pointLight);

    // Raycaster para cliques
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshesNos = Array.from(nosPorId.values()).flatMap((g) => g.children);
      const intersectos = raycaster.intersectObjects(meshesNos);

      if (intersectos.length > 0) {
        // Acha qual nó foi clicado
        for (const [noId, grupo] of nosPorId.entries()) {
          if (grupo.children.some((c) => intersectos[0].object === c)) {
            // Dispara circuit breaker
            circuitBreakerRef.current.set(noId, {
              id: noId,
              fase: "aberto",
              tempo: 0,
            });
            break;
          }
        }
      }
    };
    canvas.addEventListener("click", handleClick);

    // Loop de animação
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      tempoAnimacaoRef.current += 0.016; // ~60fps
      tempoAberturaRef.current += 0.016;

      // Animar nascimento dos nós (primeiros 6-8s)
      const tempoAbertura = Math.min(tempoAberturaRef.current, 8);
      const progAbertura = tempoAbertura / 8;

      for (const no of nos) {
        const grupo = nosPorId.get(no.id);
        if (!grupo) continue;

        const deveMostrar = tempoAbertura >= (no.nascimento / 364) * 8;
        grupo.visible = deveMostrar;

        if (deveMostrar) {
          // Pulsação sutil
          const pulsacao = 1 + Math.sin(tempoAnimacaoRef.current * 2 + no.hue / 60) * 0.1;
          grupo.scale.setScalar(pulsacao);
        }
      }

      // Atualizar circuit breakers
      for (const [noId, cb] of circuitBreakerRef.current.entries()) {
        cb.tempo += 0.016;
        const grupo = nosPorId.get(noId);
        if (!grupo) continue;

        if (cb.fase === "aberto" && cb.tempo > 3) {
          cb.fase = "meio-aberto";
          cb.tempo = 0;
        } else if (cb.fase === "meio-aberto" && cb.tempo > 2) {
          cb.fase = "normal";
          circuitBreakerRef.current.delete(noId);
        }

        // Aplicar cores conforme fase
        const meshNucleo = grupo.children[0] as THREE.Mesh;
        if (meshNucleo && meshNucleo.material instanceof THREE.MeshStandardMaterial) {
          let cor: string;
          if (cb.fase === "aberto") {
            cor = paleta.fail[1];
          } else if (cb.fase === "meio-aberto") {
            cor = paleta.halfOpen;
          } else {
            cor = paleta.core;
          }
          (meshNucleo.material as THREE.MeshStandardMaterial).color.set(cor);
        }
      }

      // Câmera controlada por scroll (será settada pelo pai)
      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("click", handleClick);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [nos, ligacoes, calendario]);

  // Atualizar cores quando tema muda
  useEffect(() => {
    if (!sceneRef.current) return;
    const paleta = PALETAS[tema].scene;

    // Atualizar materiais com novas cores
    for (const [key, mat] of materiaisRef.current.entries()) {
      if (key.startsWith("nucleo-") && mat instanceof THREE.MeshStandardMaterial) {
        mat.color.set(paleta.core);
        mat.emissive.set(paleta.core);
      } else if (key.startsWith("halo-") && mat instanceof THREE.SpriteMaterial) {
        mat.color.set(paleta.halo);
      } else if (key.startsWith("filamento-") && mat instanceof THREE.LineBasicMaterial) {
        mat.color.set(paleta.filament);
      }
    }
  }, [tema]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
