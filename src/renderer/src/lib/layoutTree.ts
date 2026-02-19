import { v4 as uuidv4 } from 'uuid'

export interface SplitNode {
  type: 'split'
  id: string
  direction: 'horizontal' | 'vertical'
  sizes: [number, number] // percentuais, soma = 100
  children: [LayoutNode, LayoutNode]
}

export interface LeafNode {
  type: 'leaf'
  id: string
  panelId: string
}

export type LayoutNode = SplitNode | LeafNode

export function makeLeaf(panelId: string): LeafNode {
  return { type: 'leaf', id: uuidv4(), panelId }
}

/** Divide um leaf em dois, retornando novo nó de split */
export function splitLeaf(
  root: LayoutNode,
  targetLeafId: string,
  newPanelId: string,
  direction: 'horizontal' | 'vertical',
  insertAfter = true
): LayoutNode {
  if (root.type === 'leaf') {
    if (root.id !== targetLeafId) return root
    const newLeaf = makeLeaf(newPanelId)
    const children: [LayoutNode, LayoutNode] = insertAfter
      ? [root, newLeaf]
      : [newLeaf, root]
    return {
      type: 'split',
      id: uuidv4(),
      direction,
      sizes: [50, 50],
      children
    }
  }

  // split node
  const [a, b] = root.children
  const newA = splitLeaf(a, targetLeafId, newPanelId, direction, insertAfter)
  const newB = splitLeaf(b, targetLeafId, newPanelId, direction, insertAfter)

  if (newA === a && newB === b) return root
  return { ...root, children: [newA, newB] }
}

/** Remove um painel do layout. Retorna null se a árvore ficou vazia. */
export function removePanel(
  root: LayoutNode,
  panelId: string
): LayoutNode | null {
  if (root.type === 'leaf') {
    return root.panelId === panelId ? null : root
  }

  const [a, b] = root.children
  const newA = removePanel(a, panelId)
  const newB = removePanel(b, panelId)

  if (newA === null && newB === null) return null
  if (newA === null) return newB
  if (newB === null) return newA

  if (newA === a && newB === b) return root
  return { ...root, children: [newA, newB] }
}

/** Troca dois painéis de posição na árvore */
export function swapPanels(
  root: LayoutNode,
  panelIdA: string,
  panelIdB: string
): LayoutNode {
  return mapLeaves(root, (leaf) => {
    if (leaf.panelId === panelIdA) return { ...leaf, panelId: panelIdB }
    if (leaf.panelId === panelIdB) return { ...leaf, panelId: panelIdA }
    return leaf
  })
}

/**
 * Move um painel para uma nova posição, dividindo o painel alvo.
 * zone: 'top' | 'bottom' | 'left' | 'right'
 */
export function movePanelToSplit(
  root: LayoutNode,
  sourcePanelId: string,
  targetLeafId: string, // id do LeafNode alvo
  zone: 'top' | 'bottom' | 'left' | 'right'
): LayoutNode {
  // 1. Remover painel fonte da árvore
  const withoutSource = removePanel(root, sourcePanelId)
  if (!withoutSource) return root

  // 2. Encontrar novo leafId do targetLeaf após remoção
  const direction: 'horizontal' | 'vertical' =
    zone === 'left' || zone === 'right' ? 'horizontal' : 'vertical'
  const insertAfter = zone === 'right' || zone === 'bottom'

  // 3. Dividir o leaf alvo inserindo o painel fonte
  return splitLeaf(withoutSource, targetLeafId, sourcePanelId, direction, insertAfter)
}

/** Atualiza os tamanhos de um split específico */
export function updateSizes(
  root: LayoutNode,
  splitId: string,
  sizes: [number, number]
): LayoutNode {
  if (root.type === 'leaf') return root
  if (root.id === splitId) return { ...root, sizes }

  const [a, b] = root.children
  const newA = updateSizes(a, splitId, sizes)
  const newB = updateSizes(b, splitId, sizes)
  if (newA === a && newB === b) return root
  return { ...root, children: [newA, newB] }
}

/** Encontra um leaf pelo panelId */
export function findLeafByPanelId(
  root: LayoutNode,
  panelId: string
): LeafNode | null {
  if (root.type === 'leaf') {
    return root.panelId === panelId ? root : null
  }
  return (
    findLeafByPanelId(root.children[0], panelId) ??
    findLeafByPanelId(root.children[1], panelId)
  )
}

/** Coleta todos os panelIds da árvore */
export function allPanelIds(root: LayoutNode): string[] {
  if (root.type === 'leaf') return [root.panelId]
  return [...allPanelIds(root.children[0]), ...allPanelIds(root.children[1])]
}

function mapLeaves(
  root: LayoutNode,
  fn: (leaf: LeafNode) => LeafNode
): LayoutNode {
  if (root.type === 'leaf') return fn(root)
  const [a, b] = root.children
  const newA = mapLeaves(a, fn)
  const newB = mapLeaves(b, fn)
  if (newA === a && newB === b) return root
  return { ...root, children: [newA, newB] }
}
