'use strict';
const DynamoClient = require('../utils/dynamoClient');
const dynamo = DynamoClient.getInstance();
const marcaMap = require('../utils/marcaConfig');
const Pedido = require('../model/pedidoOsd');
const sqsRepositoryPedido = require('../sqs/sqsRepositoryPedido');
const { getFormattedDate } = require('../utils/dateUtils.js');
class PedidoRepository {
    constructor() {
        this.table = process.env.AWS_TABLE_PEDIDO_OSD;
    }
    
    async createPedido(data){
        //const startTime = moment();
        
        let pk = data.marca.toUpperCase()+"#"+data.canal.toUpperCase()+"#"+data.tienda.toUpperCase();
        let sk = data.ship_via.toUpperCase()+"#"+data.sales_type.toUpperCase()+"#"+data.action.toUpperCase();
        console.log("Creando PK " + pk + " sk " + sk);
        try {
            let datosParaActualizar = {
                pk: pk,
                sk: sk,
                id_pedido: data.id_pedido.toUpperCase() ,
                order_id:data.order_id.toUpperCase(),
                client_name: data.client_name.toUpperCase(),
                date: data.date,
                dateServer: getFormattedDate(),
                sales_type: data.sales_type.toUpperCase(),
                sales_type_name: data.sales_type_name.toUpperCase(),
                ship_via: data.ship_via.toUpperCase(),
                ship_via_name: data.ship_via_name.toUpperCase(),
                action: data.action.toUpperCase(),
                nro_correlativo: data.nro_correlativo.toUpperCase(),
                marca: data.marca.toUpperCase(),
                canal: data.canal.toUpperCase(),
                tienda: data.tienda.toUpperCase()
            };
            
            // Actualizar o crear el pedido
            let resultado = await Pedido.create(datosParaActualizar);
            // ACtualizar código cuando se habilite bucket
            
            return resultado;
        } catch (error) {
            console.error('Error creando el pedido:', error);
            return error;
        }
    }

    async searchPedidoByPkAndSk(pk,sk){
        console.log("Pk db " + pk)
        console.log("Sk db " + sk)
        let params = {
            TableName: this.table,
            KeyConditionExpression:'pk = :v_pk and begins_with(sk, :v_sk)',
    
            ExpressionAttributeValues: { 
                    ":v_pk": pk, 
                    ":v_sk": sk
                }
        }
        const data = await dynamo.query(params).promise();
        console.log("Datos filtrados", data);
        return data.Items;
    }
}




module.exports = new PedidoRepository();