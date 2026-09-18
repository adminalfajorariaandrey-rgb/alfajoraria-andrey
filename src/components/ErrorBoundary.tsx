import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShoppingBag, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  onClearCart?: () => void;
  isModal?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou uma falha de renderização:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleClearCart = () => {
    try {
      localStorage.removeItem('alfajor_cart_items_v2');
      localStorage.removeItem('alfajor_cart_boxes_v2');
      localStorage.removeItem('alfajor_cart_items');
      localStorage.removeItem('alfajor_cart_boxes');
    } catch {
      // Ignora erro de localStorage
    }
    if (this.props.onClearCart) {
      this.props.onClearCart();
    }
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      const content = (
        <div className="bg-white rounded-3xl p-6 border border-[#E8DEC7] shadow-xl max-w-md w-full text-center space-y-4 my-6 mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF8F0] border border-[#E2D6C0] flex items-center justify-center mx-auto text-[#8C5D38] shadow-xs">
            <ShoppingBag className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-serif-brand text-lg font-bold text-[#2B1810]">
              {this.props.fallbackTitle || 'Houve uma instabilidade no carrinho'}
            </h3>
            <p className="text-xs text-[#7A6453] mt-1.5 leading-relaxed">
              {this.props.fallbackMessage ||
                'Detectamos itens locais em formato incompatível ou desatualizado. Você pode recarregar ou limpar os itens para restabelecer o pedido com segurança.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>

            <button
              type="button"
              onClick={this.handleClearCart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar e Restaurar</span>
            </button>
          </div>
        </div>
      );

      if (this.props.isModal) {
        return (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
            {content}
          </div>
        );
      }

      return content;
    }

    return this.props.children;
  }
}
