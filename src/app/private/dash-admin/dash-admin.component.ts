import { Component, ViewChild, inject } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ProviderService } from '../../services/provider.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { WebSocketsService } from '../../services/web-sockets.service';
// CORRECCIÓN 1: Importamos DecimalPipe
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dash-admin',
  standalone: true,
  // CORRECCIÓN 2: Agregamos DecimalPipe al array de imports
  imports: [
    DecimalPipe, 
    BaseChartDirective, 
    MatCardModule, 
    MatButtonModule, 
    MatListModule, 
    MatDividerModule
  ],
  templateUrl: './dash-admin.component.html',
  styleUrl: './dash-admin.component.scss'
})
export class DashAdminComponent {
  private _provider: ProviderService = inject(ProviderService);
  private _wsService: WebSocketsService = inject(WebSocketsService);
  
  products: any = [];
  clients: any = [];
  avg: any = [];
  total: any = [];
  sales: any = [];
  
  dataSales!: ChartData<'doughnut'>;
  dataProduct!: ChartData<'pie'>;
  dataClient!: ChartData<'pie'>;
  
  totalSum: number = 0;
  
  @ViewChild('chartSales') chartSales!: BaseChartDirective;
  @ViewChild('chartProducts') chartProducts!: BaseChartDirective;
  @ViewChild('chartClients') chartClients!: BaseChartDirective;

  // Opciones para las gráficas de pastel
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed;
            }
            return label;
          }
        }
      }
    }
  };

  // Opciones para la gráfica de dona
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': $';
            }
            if (context.parsed !== null) {
              label += context.parsed.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    cutout: '60%' 
  };

  async ngOnInit() {
    await this.Sales();
    await this.bestSeller();
    await this.bestClient();
    
    this.total = await this._provider.request('GET', 'graphics/totalSales');
    this.avg = await this._provider.request('GET', 'graphics/avgTime');
    
    this.listenGraphics();
  }

  async listenGraphics() {
    this._wsService.listen('grafica').subscribe((data) => {
      let btotal: number = parseInt(data.total ?? 0);
      let monthIndex = data.mes - 1;
      let atotal: number = this.dataSales.datasets[0].data[monthIndex] as number ?? 0;
      
      this.dataSales.datasets[0].data[monthIndex] = btotal + atotal;
      this.total.total = parseInt(this.total.total) + data.total;
      
      console.log(data);
      
      if (this.chartSales) {
        this.chartSales.update();
      }
    });
  }

  async Sales() {
    this.sales = await this._provider.request('GET', 'graphics/sales');
    
    const monthColors = [
      'rgba(255, 99, 132, 0.8)',   
      'rgba(54, 162, 235, 0.8)',   
      'rgba(255, 206, 86, 0.8)',   
      'rgba(75, 192, 192, 0.8)',   
      'rgba(153, 102, 255, 0.8)',  
      'rgba(255, 159, 64, 0.8)',   
      'rgba(199, 199, 199, 0.8)',  
      'rgba(83, 102, 255, 0.8)',   
      'rgba(255, 99, 255, 0.8)',   
      'rgba(99, 255, 132, 0.8)',   
      'rgba(255, 159, 243, 0.8)',  
      'rgba(159, 243, 255, 0.8)'   
    ];

    this.dataSales = {
      labels: this.sales.labels,
      datasets: [
        {
          data: this.sales.data,
          label: 'Ventas',
          backgroundColor: monthColors,
          borderColor: monthColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 15
        }
      ]
    };
  }

  async bestSeller() {
    this.products = await this._provider.request('GET', 'graphics/bestSeller', { mes: 5 });
    
    const productColors = [
      'rgba(46, 102, 67, 0.8)',    
      'rgba(87, 171, 115, 0.8)',   
      'rgba(139, 195, 74, 0.8)',   
      'rgba(255, 193, 7, 0.8)',    
      'rgba(255, 152, 0, 0.8)',    
      'rgba(244, 67, 54, 0.8)',    
      'rgba(233, 30, 99, 0.8)',    
      'rgba(156, 39, 176, 0.8)',   
      'rgba(103, 58, 183, 0.8)',   
      'rgba(63, 81, 181, 0.8)'     
    ];

    this.dataProduct = {
      labels: this.products.labels,
      datasets: [
        {
          data: this.products.data,
          label: 'Cantidad vendida',
          backgroundColor: productColors,
          borderColor: productColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 15
        }
      ]
    };
  }

  async bestClient() {
    this.clients = await this._provider.request('GET', 'graphics/bestClient');
    
    const clientColors = [
      'rgba(76, 175, 80, 0.8)',    
      'rgba(33, 150, 243, 0.8)',   
      'rgba(255, 193, 7, 0.8)',    
      'rgba(233, 30, 99, 0.8)',    
      'rgba(255, 87, 34, 0.8)',    
      'rgba(156, 39, 176, 0.8)',   
      'rgba(0, 188, 212, 0.8)',    
      'rgba(121, 85, 72, 0.8)',    
      'rgba(158, 158, 158, 0.8)',  
      'rgba(255, 235, 59, 0.8)'    
    ];

    this.dataClient = {
      labels: this.clients.labels,
      datasets: [
        {
          data: this.clients.data,
          label: 'Número de compras',
          backgroundColor: clientColors,
          borderColor: clientColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 15
        }
      ]
    };
  }
}