---
name: decisions
description: Registro histórico de decisões do projeto. Este arquivo documenta TODAS as decisões relevantes tomadas ao longo do desenvolvimento, incluindo o contexto, o motivo e o impacto. Serve como fonte de verdade para o agente.
license: Complete terms in LICENSE.txt
---

## VISÃO GERAL

Este arquivo é o **histórico oficial de decisões do projeto**.

Ele existe para:
- Registrar **o que foi decidido**
- Explicar **por que a decisão foi tomada**
- Preservar **o contexto técnico, estratégico ou conceitual**
- Evitar retrabalho, contradições e decisões conflitantes no futuro

Este documento é **vivo** e deve evoluir junto com o projeto.

---

## REGRA CRÍTICA PARA O AGENTE

**O agente DEVE:**
- Consultar este arquivo **sempre que precisar tomar decisões técnicas, arquiteturais, de design ou de produto**
- Respeitar decisões já registradas, a menos que exista uma justificativa clara para revisá-las
- Atualizar este arquivo **toda vez que uma nova decisão importante for tomada**

Ignorar este arquivo significa **perder contexto histórico**, o que pode levar a erros, inconsistências ou regressões.

---

## O QUE CONSTITUI UMA "DECISÃO IMPORTANTE"

Uma decisão DEVE ser registrada aqui quando envolver:
- Arquitetura (frontend, backend, infraestrutura, stack)
- Padrões de design, UI ou UX
- Mudança de direção estética ou conceitual
- Escolhas técnicas com impacto de longo prazo
- Alterações em fluxos principais
- Restrições assumidas conscientemente
- Trade-offs relevantes (o que foi escolhido vs. o que foi descartado)
- Reversões ou correções de decisões anteriores

Pequenos ajustes visuais ou correções triviais **não precisam** ser registrados.

---

## FORMATO PADRÃO DE REGISTRO

Cada decisão deve seguir **rigorosamente** o formato abaixo.

### 📌 Decisão #[ID]
- **Data**: YYYY-MM-DD
- **Área**: (ex: Frontend, Design, Arquitetura, Produto, Infraestrutura)
- **Status**: (Ativa | Revisada | Depreciada)
- **Contexto**:  
  Explique brevemente o problema, necessidade ou situação que levou à decisão.
- **Decisão**:  
  Descreva claramente o que foi decidido, sem ambiguidade.
- **Motivo**:  
  Justifique a decisão. Explique o raciocínio, os critérios usados e os objetivos.
- **Alternativas Consideradas**:  
  Liste opções que foram avaliadas e por que foram descartadas (se aplicável).
- **Impacto**:  
  Quais áreas do projeto essa decisão afeta? Há implicações futuras?
- **Observações**:  
  Notas adicionais, riscos conhecidos ou condições para revisão futura.

---

## HISTÓRICO DE DECISÕES

> ⚠️ **IMPORTANTE**  
> As decisões devem ser adicionadas **em ordem cronológica**, da mais antiga para a mais recente.  
> Nunca apague decisões antigas — se algo mudar, marque o status como **Revisada** ou **Depreciada** e crie uma nova decisão.

---

### 📌 Decisão #001
- **Data**: YYYY-MM-DD
- **Área**: —
- **Status**: Ativa
- **Contexto**: —
- **Decisão**: —
- **Motivo**: —
- **Alternativas Consideradas**: —
- **Impacto**: —
- **Observações**: —

---

## BOAS PRÁTICAS

- Seja **objetivo**, mas **explique o suficiente para alguém novo entender**
- Pense neste arquivo como uma conversa com o **você do futuro**
- Prefira clareza a linguagem rebuscada
- Se uma decisão parecer “óbvia”, registre mesmo assim — o óbvio hoje pode não ser amanhã

---

## PRINCÍPIO FINAL

Este arquivo não é burocracia.  
Ele é **memória institucional**, **alinhamento** e **inteligência acumulada**.

Projetos bem construídos não dependem apenas de boas ideias —  
dependem de **boas decisões bem documentadas**.
