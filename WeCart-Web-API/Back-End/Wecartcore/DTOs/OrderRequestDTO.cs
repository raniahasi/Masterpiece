using static Wecartcore.DTO.OrderDetailsDto;

namespace Wecartcore.DTO
{
    public class OrderRequestDTO
    {
        public int? UserId { get; set; }

        public decimal? Amount { get; set; }

        public int? CoponId { get; set; }

        public string? Status { get; set; }

        public string? TransactionId { get; set; }


        public List<OrderItemDTO> Items { get; set; }

    }
    public class OrderItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
