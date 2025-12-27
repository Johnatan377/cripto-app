
# 🚀 Cripto App Mobile

Projeto de acompanhamento de carteira cripto otimizado para smartphones.

## 🛠️ Como Instalar e Rodar

### 1. Corrigindo o Erro de Script (Windows)
Se você recebeu um erro de "execução de scripts desabilitada" no PowerShell, abra o **PowerShell como Administrador** e rode:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Digite `Y` para confirmar.

### 2. Instalando Dependências
No terminal do seu projeto:
```bash
npm install
```

### 3. Rodando o Projeto
Para abrir no navegador do PC:
```bash
npm run dev
```

Para abrir no **Smartphone**:
```bash
npm run dev -- --host
```
Copie o endereço que aparecer em "Network" (ex: `http://192.168.0.10:5173`) e cole no navegador do seu celular.

## 📱 Dica de PWA
No iPhone (Safari) ou Android (Chrome), use a opção **"Adicionar à Tela de Início"** para usar o app em tela cheia como se fosse um aplicativo nativo!
