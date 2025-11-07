-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: imobiliaria-mysql
-- Tempo de geração: 07/11/2025 às 23:06
-- Versão do servidor: 8.4.6
-- Versão do PHP: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `imobiliaria`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`) VALUES
(1, 'Residencial'),
(2, 'Alto Padrão'),
(3, 'Comercial'),
(4, 'Terrenos'),
(5, 'Temporada');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cidades`
--

CREATE TABLE `cidades` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `estado` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `cidades`
--

INSERT INTO `cidades` (`id`, `nome`, `estado`) VALUES
(1, 'São Paulo', 'SP'),
(2, 'Rio de Janeiro', 'RJ'),
(3, 'Belo Horizonte', 'MG'),
(4, 'Curitiba', 'PR'),
(5, 'Florianópolis', 'SC');

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

CREATE TABLE `contratos` (
  `id` int NOT NULL,
  `imovel_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tipo_contrato` enum('aluguel','venda') NOT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `valor` decimal(15,2) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `fotos`
--

CREATE TABLE `fotos` (
  `id` int NOT NULL,
  `imovel_id` int NOT NULL,
  `url` varchar(255) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `fotos`
--

INSERT INTO `fotos` (`id`, `imovel_id`, `url`, `descricao`) VALUES
(3, 11, '/uploads/imoveis/11/1762374252775-cfraulv2.webp', 'teste'),
(4, 11, '/uploads/imoveis/11/1762374290427-10s0oa4d.webp', NULL),
(5, 11, '/uploads/imoveis/11/1762374980440-n68ufr03.webp', NULL),
(6, 12, '/uploads/imoveis/12/1762376803160-uin56hen.webp', NULL),
(7, 13, '/uploads/imoveis/13/1762376816977-cd6cmcj4.webp', NULL),
(8, 14, '/uploads/imoveis/14/1762376827960-urlvhjh9.webp', NULL),
(9, 15, '/uploads/imoveis/15/1762376838040-9w7684a1.webp', NULL),
(10, 12, '/uploads/imoveis/12/1762554997845-10nm9exk.jpg', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `imoveis`
--

CREATE TABLE `imoveis` (
  `id` int NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descricao` text,
  `tipo` enum('casa','apartamento','terreno','comercial') NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `cidade_id` int DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `valor` decimal(15,2) NOT NULL,
  `status` enum('disponivel','alugado','vendido') DEFAULT 'disponivel',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `imoveis`
--

INSERT INTO `imoveis` (`id`, `titulo`, `descricao`, `tipo`, `categoria_id`, `cidade_id`, `endereco`, `valor`, `status`, `criado_em`) VALUES
(11, 'Apartamento Garden no Centro', '3 dormitórios, 2 vagas, área gourmet integrada.', 'apartamento', 1, 1, 'Rua das Acácias, 120', 680000.00, 'disponivel', '2025-11-05 03:12:34'),
(12, 'Cobertura Vista Mar', 'Cobertura duplex com piscina privativa e vista panorâmica.', 'apartamento', 2, 2, 'Av. Atlântica, 2450', 1250000.00, 'disponivel', '2025-11-05 03:12:34'),
(13, 'Casa Térrea com Jardim', 'Casa térrea aconchegante com 4 quartos e amplo quintal arborizado.', 'casa', 1, 3, 'Rua das Limeiras, 45', 520000.00, 'vendido', '2025-11-05 03:12:34'),
(14, 'Sala Comercial 40m²', 'Conjunto comercial mobiliado ao lado do metrô.', 'comercial', 3, 1, 'Av. Paulista, 1000, cj. 1207', 3200.00, 'alugado', '2025-11-05 03:12:34'),
(15, 'Terreno em Condomínio Fechado', 'Terreno plano pronto para construir com infraestrutura completa.', 'terreno', 4, 4, 'Alameda Ipês, 88, Lote 12', 280000.00, 'disponivel', '2025-11-05 03:12:34');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `tipo_usuario` enum('admin','cliente','corretor') DEFAULT 'cliente',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `cidades`
--
ALTER TABLE `cidades`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imovel_id` (`imovel_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `fotos`
--
ALTER TABLE `fotos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imovel_id` (`imovel_id`);

--
-- Índices de tabela `imoveis`
--
ALTER TABLE `imoveis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `cidade_id` (`cidade_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `cidades`
--
ALTER TABLE `cidades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `fotos`
--
ALTER TABLE `fotos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `imoveis`
--
ALTER TABLE `imoveis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `contratos_ibfk_1` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`),
  ADD CONSTRAINT `contratos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `fotos`
--
ALTER TABLE `fotos`
  ADD CONSTRAINT `fotos_ibfk_1` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `imoveis`
--
ALTER TABLE `imoveis`
  ADD CONSTRAINT `imoveis_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `imoveis_ibfk_2` FOREIGN KEY (`cidade_id`) REFERENCES `cidades` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
