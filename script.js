// URL base da API do Rick and Morty
const BASE_URL = "https://rickandmortyapi.com/api";

// Referências aos elementos da página
const form = document.getElementById('form-busca');
const campo = document.getElementById('campo-busca');
const filtroStatus = document.getElementById('filtro-status');
const mensagem = document.getElementById('mensagem');
const resultado = document.getElementById('resultado');

// Tradução dos valores que a API devolve (em inglês) para exibir em português
const traducaoStatus = { Alive: 'Vivo', Dead: 'Morto', unknown: 'Desconhecido' };
const traducaoGenero = { Male: 'Masculino', Female: 'Feminino', Genderless: 'Sem gênero', unknown: 'Desconhecido' };

/**
 * Faz a requisição à API.
 * - "async" permite usar "await" dentro da função.
 * - Retorna os dados já convertidos de JSON para objeto JavaScript.
 */
async function buscarDados(endpoint) {
  // await pausa a função até a Promise do fetch ser resolvida
  const response = await fetch(`${BASE_URL}${endpoint}`);

  // response.ok é false para status 4xx e 5xx (ex.: 404)
  if (!response.ok) {
    // A API devolve 404 quando nenhum personagem é encontrado
    if (response.status === 404) {
      throw new Error('Nenhum personagem encontrado com esses filtros.');
    }
    throw new Error('Erro na requisição: ' + response.status);
  }

  // Segundo await: converter o corpo da resposta em JSON
  return await response.json();
}

/**
 * Cria um parágrafo "Rótulo: valor" usando createElement.
 */
function criarInfo(rotulo, valor) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = rotulo + ': ';
  p.appendChild(strong);
  p.appendChild(document.createTextNode(valor));
  return p;
}

/**
 * Monta um card (imagem + nome + status + espécie + gênero + origem + localização)
 * para um personagem e devolve o elemento pronto.
 */
function criarCard(personagem) {
  const card = document.createElement('article');
  card.classList.add('card');

  // Imagem do personagem
  const img = document.createElement('img');
  img.src = personagem.image;
  img.alt = 'Foto de ' + personagem.name;
  img.loading = 'lazy';

  // Container do texto
  const corpo = document.createElement('div');
  corpo.classList.add('card-corpo');

  const titulo = document.createElement('h2');
  titulo.textContent = personagem.name;

  // Etiqueta de status (a classe muda a cor: alive / dead / unknown)
  const status = document.createElement('span');
  status.classList.add('status', personagem.status.toLowerCase());
  status.textContent = traducaoStatus[personagem.status] || personagem.status;

  // Informações do personagem
  corpo.appendChild(titulo);
  corpo.appendChild(status);
  corpo.appendChild(criarInfo('Espécie', personagem.species));
  corpo.appendChild(criarInfo('Gênero', traducaoGenero[personagem.gender] || personagem.gender));
  corpo.appendChild(criarInfo('Origem', personagem.origin.name));
  corpo.appendChild(criarInfo('Última localização', personagem.location.name));

  card.appendChild(img);
  card.appendChild(corpo);
  return card;
}

/**
 * Limpa a área de resultados e adiciona um card para cada personagem.
 */
function mostrarResultado(personagens) {
  resultado.innerHTML = '';
  personagens.forEach((personagem) => {
    resultado.appendChild(criarCard(personagem));
  });
}

/**
 * Lê os filtros, busca na API e atualiza a tela.
 * É chamada tanto pelo envio do formulário quanto pela mudança do select.
 */
async function pesquisar() {
  // Indicador de carregamento enquanto a Promise está pendente
  mensagem.classList.remove('erro');
  mensagem.textContent = 'Carregando...';
  resultado.innerHTML = '';

  // Monta a query string com os filtros preenchidos
  const params = new URLSearchParams();
  const nome = campo.value.trim();
  if (nome) params.set('name', nome);
  if (filtroStatus.value) params.set('status', filtroStatus.value);

  try {
    const dados = await buscarDados(`/character/?${params.toString()}`);
    mensagem.textContent = `${dados.info.count} personagem(ns) encontrado(s). Mostrando ${dados.results.length}.`;
    mostrarResultado(dados.results);
  } catch (error) {
    // Mostra o erro na página (não só no console)
    mensagem.classList.add('erro');
    mensagem.textContent = 'Não foi possível carregar os dados. ' + error.message;
    resultado.innerHTML = '';
  }
}

// Interação 1: envio do formulário (botão Buscar ou tecla Enter)
form.addEventListener('submit', (event) => {
  event.preventDefault(); // evita recarregar a página
  pesquisar();
});

// Interação 2: trocar o status no select dispara uma nova requisição
filtroStatus.addEventListener('change', pesquisar);

// Carrega alguns personagens ao abrir a página
pesquisar();
