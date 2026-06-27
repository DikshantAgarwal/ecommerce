from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product
from apps.products.serializers import ProductSerializer




# This class handles GET requests to retrieve a list of products.

# The get method handles or mapped to GET requests to 
#retrieve a list of products.If someone sends Get request i.e GET /api/products/ Django calls get(Request)
class ProductListAPIView(APIView): 
    def get(self, request):
        products = Product.objects.select_related('category').all() #select_related is used to optimize the query by fetching related category data in a single query.
        # product is a queryset containing all Product instances from the database, along with their related Category instances.
        serializer = ProductSerializer(products, many=True)
        # serilizer is an instance of ProductSerializer that serializes the products queryset into a JSON-friendly format. The many=True argument indicates that we are serializing multiple instances.
        # query will start exexcutin when serialzer iterates over the products queryset to convert each Product instance into a dictionary representation.
        return Response(serializer.data, status=status.HTTP_200_OK)
          #serialzer data  is no longer query data but a list of dictionaries representing the serialized product data.
         # serilaized data is returned in the response with a status code of 200 OK, indicating a successful retrieval of the product list.
