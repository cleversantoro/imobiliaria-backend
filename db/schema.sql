-- Script de criação das tabelas principais para o sistema de imobiliária

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    tipo_usuario ENUM('admin', 'cliente', 'corretor') DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE cidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL
);

CREATE TABLE imoveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo ENUM('casa', 'apartamento', 'terreno', 'comercial') NOT NULL,
    categoria_id INT,
    cidade_id INT,
    endereco VARCHAR(200),
    valor DECIMAL(15,2) NOT NULL,
    status ENUM('disponivel', 'alugado', 'vendido') DEFAULT 'disponivel',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (cidade_id) REFERENCES cidades(id)
);

CREATE TABLE fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imovel_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imovel_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_contrato ENUM('aluguel', 'venda') NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    valor DECIMAL(15,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
