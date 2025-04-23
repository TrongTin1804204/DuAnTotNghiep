import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../security/Axios";
export const formatDateFromArray = (dateArray) => {
  if (!dateArray) return '';

  const year = dateArray[0];
  const month = String(dateArray[1]).padStart(2, '0');
  const day = String(dateArray[2]).padStart(2, '0');
  const hour = String(dateArray[3]).padStart(2, '0');
  const minute = String(dateArray[4]).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default function EditDiscounts() {
  const { idDGG } = useParams();
  const [filters, setFilters] = useState({ search: "" });
  const [editMaDGG, editDGG] = useState({
    maDotGiamGia: "",
    tenDotGiamGia: "",
    hinhThuc: "%",
    giaTri: null,
    ngayBatDau: "",
    ngayKetThuc: "",
    ngayTao: new Date(),
    ngaySua: new Date(),
  });
  const navigate = useNavigate(); // Khởi tạo hook điều hướng
  const [sanPhams, setSanPhams] = useState([]);
  const limit = 4; // Số bản ghi trên mỗi trang
  const [skip, setSkip] = useState(0); // Vị trí bắt đầu
  const limitCt = 5; // Số bản ghi trên mỗi trang
  const [skipCt, setSkipCt] = useState(0); // Vị trí bắt đầu
  const [totalPages, setTotalPages] = useState(1);
  const [totalPagesCt, setTotalPagesCt] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageCt, setCurrentPageCt] = useState(1);
  const [sanPhamChiTiets, setSanPhamChiTiets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedIdsCt, setSelectedIdsCt] = useState([]);
  const [errorName, setErrorName] = useState(false);
  const [errorGiaTri, setErrorGiaTri] = useState(false);
  const [errorNBT, setErrorNBT] = useState(false);
  const [errorNKT, setErrorNKT] = useState(false);

  const handleUpdate = async () => {
    const now = new Date().toISOString().slice(0, 16); // Lấy ngày giờ hiện tại (yyyy-MM-ddTHH:mm)
    // Kiểm tra nếu tên đợt giảm giá trống
    if (!editMaDGG.tenDotGiamGia) {
      setErrorName(true); // Hiển thị lỗi nếu không có tên
      return; // Dừng hàm nếu chưa nhập tên
    } else {
      setErrorName(false); // Nếu đã có tên thì xóa lỗi
    }
    if (!editMaDGG.giaTri) {
      setErrorGiaTri(true);
      return;
    } else {
      setErrorGiaTri(false);
    }
    // Kiểm tra nếu ngày bắt đầu chưa được chọn
    if (!editMaDGG.ngayBatDau) {
      setErrorNBT(true); // Hiển thị lỗi nếu chưa chọn ngày
      toast.error("Ngày bắt đầu không được để trống!");
      return;
    } else if (editMaDGG.ngayBatDau < now) {
      setErrorNBT(true);
      toast.error("Ngày bắt đầu không được là ngày quá khứ!", {
        position: "top-right",
      });
      return;
    } else {
      setErrorNBT(false); // Nếu đã chọn ngày, xóa lỗi
    }
    if (!editMaDGG.ngayKetThuc) {
      setErrorNKT(true);
      toast.error("Ngày kết thúc không được để trống!", {
        position: "top-right",
      });
      return;
    } else if (editMaDGG.ngayKetThuc < now) {
      setErrorNKT(true);
      toast.error("Ngày kết thúc không được là ngày quá khứ!", {
        position: "top-right",
      });
      return;
    } else if (editMaDGG.ngayKetThuc <= editMaDGG.ngayBatDau) {
      setErrorNKT(true);
      toast.error("Ngày kết thúc không thể nhỏ hơn hoặc bằng ngày bắt đầu!", {
        position: "top-right",
      });
      return;
    } else {
      setErrorNKT(false);
    }
    // Nếu có lỗi, dừng việc gọi hàm cập nhật
    if (!editMaDGG.tenDotGiamGia || !editMaDGG.giaTri) {
      return;
    }
    const result = await editDotGiamGias(); // Gọi hàm cập nhật
    if (result && result.status === 1) {
      toast.success("Cập nhật thành công!", {
        position: "top-right", // Đảm bảo rằng bạn đã sử dụng position đúng
        style: {
          backgroundColor: "#28a745",
          color: "white",
          borderRadius: "8px",
          pediting: "10px 20px",
        },
      });
      navigate("/admin/discounts"); // Chuyển hướng sau 1 giây
    } else {
      toast.error("Cập nhật không thành công, vui lòng thử lại!", {
        position: "top-right",
        style: {
          backgroundColor: "#dc3545",
          color: "white",
          borderRadius: "8px",
          pediting: "10px 20px",
        },
      });
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCheckAllChange = () => {
    if (selectedIds.length === sanPhams.length) {
      setSelectedIds([]); // Bỏ chọn tất cả
    } else {
      setSelectedIds(sanPhams.map((item) => item.idSanPham)); // Chọn tất cả
    }
  };

  const handleCheckboxChangeCt = (id) => {
    setSelectedIdsCt((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const checkedAllCt = () => {
    const filteredSanPhamsCt = sanPhamChiTiets.filter((sp) =>
      selectedIdsCt.includes(sp.idChiTietSanPham)
    );
    return filteredSanPhamsCt.length === sanPhamChiTiets.length;
  };

  const handleCheckAllChangeCt = () => {
    if (checkedAllCt()) {
      const filteredSanPhamsCt = sanPhamChiTiets.filter((sp) =>
        selectedIdsCt.includes(sp.idChiTietSanPham)
      );
      const filteredIdSanPhamsCt = filteredSanPhamsCt.map(
        (i) => i.idChiTietSanPham
      );
      const selectedIdsNew = selectedIdsCt.filter(
        (e) => !filteredIdSanPhamsCt.includes(e)
      );
      setSelectedIdsCt(selectedIdsNew);
      // setSelectedIds([]); // Bỏ chọn tất cả
    } else {
      setSelectedIdsCt(sanPhamChiTiets.map((item) => item.idChiTietSanPham)); // Chọn tất cả
    }
  };

  // useEffect(() => {
  //   if (!sanPhamChiTiets || (sanPhamChiTiets && sanPhamChiTiets.length <= 0))
  //     return setSelectedIdsCt([]);
  //   const arrId = sanPhamChiTiets.map((i) => i.idChiTietSanPham);
  //   const a = arrId.filter((id) => selectedIdsCt.includes(id));
  //   setSelectedIdsCt(a);
  // }, [sanPhamChiTiets]);

  useEffect(() => {
    fetchdotGiamGia();
    fetchSanPham(skip, limit);
  }, [skip, limit]);

  useEffect(() => {
    if (!filters.search.trim()) {
      fetchSanPham(0, 4); // Hiển thị dữ liệu gốc thay vì gọi API
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchSanPham(0, 4);
    }, 500); // Đợi 0.5 giây trước khi gọi hàm

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    if (!selectedIds || (selectedIds && selectedIds.length <= 0)) {
      setSanPhamChiTiets([]);
      return;
    }
    fetchChiTietSanPhams(0, 5);
    setCurrentPageCt(1);
    setSkipCt(0);
  }, [selectedIds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    editDGG((prev) => ({ ...prev, [name]: value }));
    const now = new Date().toISOString().slice(0, 16); // Lấy ngày giờ hiện tại (định dạng yyyy-MM-ddTHH:mm)
    if (name === "ngayBatDau") {
      if (value < now) {
        setErrorNBT("Không được chọn ngày trong quá khứ.");
      } else if (editMaDGG.ngayKetThuc && value > editMaDGG.ngayKetThuc) {
        setErrorNBT("Ngày bắt đầu không được lớn hơn hoặc bằng ngày kết thúc.");
        setErrorNKT("");
      } else {
        setErrorNBT("");
      }
    }

    if (name === "ngayKetThuc") {
      if (value < now) {
        setErrorNKT("Không được chọn ngày trong quá khứ.");
      } else if (editMaDGG.ngayBatDau && value < editMaDGG.ngayBatDau) {
        setErrorNKT("Ngày kết thúc không được nhỏ hơn hoặc bằng ngày bắt đầu.");
        setErrorNBT("");
      } else {
        setErrorNKT("");
      }
    }
  };

  const fetchdotGiamGia = async () => {
    try {
      const [response, response2] = await Promise.all([
        api.get(`/admin/dot-giam-gia/chi-tiet-dgg/${idDGG}`),
        api.get(`/admin/dot-giam-gia/get-list-id-san-pham-chi-tiet/${idDGG}`)
      ]);

      const body = response2.data;
      const response3 = await api.post("/admin/dot-giam-gia/get-list-id-san-pham", body);

      editDGG(prevState => ({
        ...prevState,
        ...response.data,
        ngayBatDau: formatDateFromArray(response.data.ngayBatDau),
        ngayKetThuc: formatDateFromArray(response.data.ngayKetThuc)
      }));
      setSelectedIds(response3.data);
      setSelectedIdsCt(response2.data);
    } catch (error) {
      console.error("Lỗi khi lấy đợt giảm giá:", error);
    }
  };

  const editDotGiamGias = async () => {
    try {
      const body = {
        dotGiamGia: { ...editMaDGG },
        idSanPhamChiTietList: selectedIdsCt,
      };
      const response = await api.put("/admin/dot-giam-gia/cap-nhat-dgg", body); // Bỏ {} quanh body
      return response?.status === 200 ? { status: 1 } : { status: 0 };
    } catch (error) {
      console.error("Lỗi khi cập nhật đợt giảm giá:", error);
      return { status: 0 };
    }
  };

  const fetchChiTietSanPhams = async (skip, limit) => {
    try {
      const response = await api.post(
        `/admin/dot-giam-gia/get-san-pham-chi-tiet?skip=${skip}&limit=${limit}`,
        { idSanPham: selectedIds }
      );

      setSanPhamChiTiets(response.data.data);
      const total = Number(response.data.total) / Number(limit);
      setTotalPagesCt(Math.trunc(total) + (total % 1 !== 0 ? 1 : 0));
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  const fetchSanPham = async (skip, limit) => {
    try {
      const response = await api.get(
        `/admin/dot-giam-gia/get-san-pham?skip=${skip}&limit=${limit}${filters.search ? `&tenSanPham=${filters.search}` : ""
        }`
      );

      setSanPhams(response.data.data);
      const total = Number(response.data.total) / Number(limit);
      setTotalPages(Math.trunc(total) + (total % 1 !== 0 ? 1 : 0));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };


  const nextPage = () => {
    if (currentPage < totalPages) {
      const skipNew = skip + limit;
      setSkip(skipNew);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchSanPham(skipNew, limit);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const skipNew = skip - limit;
      setSkip(skipNew);
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchSanPham(skipNew, limit);
    }
  };

  const nextPageCt = () => {
    if (currentPageCt < totalPagesCt) {
      const skipNew = skipCt + limitCt;
      setSkipCt(skipNew);
      const newPage = currentPageCt + 1;
      setCurrentPageCt(newPage);
      fetchChiTietSanPhams(skipNew, limitCt);
    }
  };

  const prevPageCt = () => {
    if (currentPageCt > 1) {
      const skipNew = skipCt - limitCt;
      setSkipCt(skipNew);
      const newPage = currentPageCt - 1;
      setCurrentPageCt(newPage);
      fetchChiTietSanPhams(skipNew, limitCt);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-lg font-semibold mb-4 inline-flex items-center">
        <h1>Đợt Giảm Giá /</h1>
        <h2 className="ml-1 font-normal text-gray-700">
          Chi Tiết Đợt Giảm Giá
        </h2>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        {/* <h2 className="text-sm font-semibold mb-4"></h2> */}
        <div className="grid grid-cols-5 gap-4">
          <div className="relative text-sm col-span-2">
            {/* Mã đợt giảm giá */}
            <label
              htmlFor="maDotGiamGia"
              className="block text-sm font-medium mb-1"
            >
              Mã đợt giảm giá: <span className="text-red-500">*</span>
            </label>
            <input
              id="maDotGiamGia"
              type="text"
              name="maDotGiamGia"
              value={editMaDGG.maDotGiamGia}
              readOnly
              onChange={(e) =>
                editDGG({ ...editMaDGG, maDotGiamGia: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
            {/* Tên đợt giảm giá */}
            <label
              htmlFor="tenDotGiamGia"
              className="block text-sm font-medium mb-1"
            >
              Tên đợt giảm giá: <span className="text-red-500">*</span>
            </label>
            <input
              id="tenDotGiamGia"
              type="text"
              name="tenDotGiamGia"
              value={editMaDGG.tenDotGiamGia}
              onChange={(e) =>
                editDGG({ ...editMaDGG, tenDotGiamGia: e.target.value })
              }
              className={`w-full p-2 border rounded-md ${errorName ? "border-red-500" : ""
                }`}
            />
            {errorName && (
              <span className="text-red-500 text-sm">
                Tên đợt giảm giá không được để trống.
              </span>
            )}{" "}
            {/* Thông báo lỗi */}
            {/* Hình thức */}
            <div className="grid grid-cols-3 gap-1">
              <h3 className="block text-sm font-medium mb-1">
                Hình thức: <span className="text-red-500">*</span>
              </h3>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hinhThuc"
                  value="%"
                  // checked={selectedOption === "option1"}
                  onChange={(e) =>
                    editDGG({
                      ...editMaDGG,
                      hinhThuc: e.target.value,
                      giaTri: "",
                    })
                  }
                  checked={editMaDGG.hinhThuc === "%"}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span>%</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hinhThuc"
                  value="VND"
                  // checked={selectedOption === "option2"}
                  onChange={(e) =>
                    editDGG({
                      ...editMaDGG,
                      hinhThuc: e.target.value,
                      giaTri: "",
                    })
                  }
                  checked={editMaDGG.hinhThuc === "VND"}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span>VND</span>
              </label>
            </div>
            {/* Giá trị */}
            <label htmlFor="giaTri" className="block text-sm font-medium mb-1">
              Giá trị <span className="text-red-500">*</span>
            </label>
            <input
              id="giaTri"
              type="text"
              name="giaTri"
              value={
                editMaDGG.giaTri ? editMaDGG.giaTri.toLocaleString("en-US") : ""
              }
              onChange={(e) => {
                let rawValue = e.target.value.replace(/,/g, ""); // Xóa dấu phẩy
                let numberValue = Number(rawValue); // Chuyển thành số nguyên
                // const value = e.target.value;
                // const regex = /^[0-9]+$/;
                if (
                  !isNaN(numberValue) &&
                  numberValue > 0 &&
                  Number.isInteger(Number(numberValue))
                ) {
                  if (editMaDGG.hinhThuc === "%" && numberValue > 100) {
                    editDGG({ ...editMaDGG, giaTri: 100 }); // Giới hạn max là 100 nếu chọn %
                  } else {
                    editDGG({ ...editMaDGG, giaTri: numberValue });
                  }
                } else {
                  editDGG({ ...editMaDGG, giaTri: null });
                }
              }}
              onKeyPress={(e) => {
                // Ngăn không cho nhập dấu cộng và dấu trừ
                if (
                  e.key === "+" ||
                  e.key === "-" ||
                  e.key === "*" ||
                  e.key === "/"
                ) {
                  e.preventDefault(); // Ngừng hành động nhập
                }
              }}
              className={`w-full p-2 border rounded-md ${errorGiaTri ? "border-red-500" : ""
                }`}
              min="1"
            />
            {errorGiaTri && (
              <span className="text-red-500 text-sm">
                Giá trị không được để trống.
              </span>
            )}{" "}
            {/* Thông báo lỗi */}
            {/* Thời gian */}
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label
                  htmlFor="dateTime"
                  className="block text-sm font-medium mb-1"
                >
                  Ngày bắt đầu: <span className="text-red-500">*</span>
                </label>
                <input
                  id="ngayBatDau"
                  type="datetime-local"
                  name="ngayBatDau"
                  value={editMaDGG.ngayBatDau}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errorNBT ? "border-red-500" : ""
                    }`}
                  min={new Date().toISOString().slice(0, 16)} // Chặn ngày quá khứ
                />
                {errorNBT && (
                  <span className="text-red-500 text-sm">{errorNBT}</span>
                )}{" "}
                {/* Hiển thị thông báo lỗi nếu chưa chọn ngày */}
              </div>
              <div>
                <label
                  htmlFor="dateTime"
                  className="block text-sm font-medium mb-1"
                >
                  Ngày kết thúc: <span className="text-red-500">*</span>
                </label>
                <input
                  id="ngayKetThuc"
                  type="datetime-local"
                  name="ngayKetThuc"
                  value={editMaDGG.ngayKetThuc}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errorNKT ? "border-red-500" : ""
                    }`}
                  min={
                    editMaDGG.ngayBatDau || new Date().toISOString().slice(0, 16)
                  } // Chặn ngày quá khứ và nhỏ hơn ngày bắt đầu
                />
                {errorNKT && (
                  <span className="text-red-500 text-sm">{errorNKT}</span>
                )}{" "}
                {/* Hiển thị thông báo lỗi nếu chưa chọn ngày */}
              </div>
            </div>
            <div className="mt-3">
              {sanPhamChiTiets.length > 0 ? null : (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                  // onClick={() => {editDotGiamGias()}}
                  onClick={handleUpdate}
                >
                  Cập nhật
                </button>
              )}
            </div>
          </div>
          <div className="relative text-sm col-span-3">
            <div className="absolute text-sm w-1/2 right-3">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Tìm theo tên..."
                className="w-full pl-10 p-2 border rounded-md"
              />
              <Search
                className="absolute right-3 top-3 text-gray-400"
                size={16}
              />
            </div>
            <div className="relative text-sm col-span-3">
              <div className=" text-sm mt-12 w-full max-h-48 overflow-y-auto border">
                <table className="w-full border-collapse text-sm pb-0 mb-0">
                  <thead className="bg-gray-100 text-center sticky top-0 z-10">
                    <tr className="bg-gray-100 text-center">
                      <th className="p-2">
                        <input
                          type="checkbox"
                          // checked={sanPhams.length > 0 && sanPhams.every(item => item.isSelected)}
                          // onChange={(e) => {
                          //   const checked = e.target.checked;
                          //   setSanPhams(sanPhams.map((item) => ({ ...item, isSelected: checked })));
                          // }}
                          checked={
                            selectedIds.length > 0 &&
                            selectedIds.length === sanPhams.length
                          }
                          onChange={handleCheckAllChange}
                        />
                      </th>
                      <th className="p-2">Mã sản phẩm</th>
                      <th className="p-2">Tên sản phẩm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sanPhams.map((sanPham, index) => (
                      <tr
                        key={sanPham.idSanPham}
                        className="border-t text-center"
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            // checked={sanPham.isSelected || false}
                            // onChange={() => {
                            //   setSanPhams((prevData) =>
                            //     prevData.map((item) =>
                            //       item.idSanPham === sanPham.idSanPham
                            //         ? { ...item, isSelected: !item.isSelected }
                            //         : item
                            //     )
                            //   );
                            // }}
                            checked={selectedIds.includes(sanPham.idSanPham)}
                            onChange={() =>
                              handleCheckboxChange(sanPham.idSanPham)
                            }
                          />
                        </td>
                        <td className="p-2">{sanPham.maSanPham}</td>
                        <td className="p-2">{sanPham.ten}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              {/* Nút Prev */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center border rounded-full ${currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
                  }`}
              >
                &lt;
              </button>

              {/* Hiển thị số trang */}
              <span className="w-10 h-10 flex items-center justify-center border rounded-full font-semibold">
                {currentPage}
              </span>

              {/* Nút Next */}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center border rounded-full ${currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
                  }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
      {sanPhamChiTiets.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold">Chi Tiết Sản Phẩm</h2>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
              // onClick={() => {editDotGiamGias()}}
              onClick={handleUpdate}
            >
              Cập nhật
            </button>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">
                  <input
                    type="checkbox"
                    // checked={sanPhamChiTiets.length > 0 && sanPhamChiTiets.every(item => item.isSelected)}
                    // onChange={(e) => {
                    //   const checked = e.target.checked;
                    //   setSanPhamChiTiets(sanPhamChiTiets.map((item) => ({ ...item, isSelected: checked })));
                    // }}
                    checked={
                      selectedIdsCt.length > 0 &&
                      selectedIdsCt.length === sanPhamChiTiets.length
                    }
                    onChange={handleCheckAllChangeCt}
                  />
                </th>
                <th className="p-2">STT</th>
                <th className="p-2">Mã sản phẩm</th>
                <th className="p-2">Tên sản phẩm</th>
                <th className="p-2">Danh mục</th>
                <th className="p-2">Thương hiệu</th>
                <th className="p-2">Chất liệu</th>
                <th className="p-2">Kích cỡ</th>
                <th className="p-2">Màu sắc</th>
                <th className="p-2">Đế giày</th>
              </tr>
            </thead>
            <tbody>
              {sanPhamChiTiets.map((sanPhamChiTiet, index) => (
                <tr key={sanPhamChiTiet.idChiTietSanPham} className="border-t">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      // checked={sanPhamChiTiet.isSelected || false}
                      // onChange={() => {
                      //   setSanPhamChiTiets((prevData) =>
                      //     prevData.map((item) =>
                      //       item.idChiTietSanPham === sanPhamChiTiet.idChiTietSanPham
                      //         ? { ...item, isSelected: !item.isSelected }
                      //         : item
                      //     )
                      //   );
                      // }}
                      checked={selectedIdsCt.includes(
                        sanPhamChiTiet.idChiTietSanPham
                      )}
                      onChange={() =>
                        handleCheckboxChangeCt(sanPhamChiTiet.idChiTietSanPham)
                      }
                    />
                  </td>
                  <td className="p-2">{index + skipCt + 1}</td>
                  <td className="p-2">{sanPhamChiTiet.sanPham.maSanPham}</td>
                  <td className="p-2">{sanPhamChiTiet.sanPham.ten}</td>
                  <td className="p-2">{sanPhamChiTiet.danhMucSanPham.ten}</td>
                  <td className="p-2">{sanPhamChiTiet.thuongHieu.ten}</td>
                  <td className="p-2">{sanPhamChiTiet.chatLieu.ten}</td>
                  <td className="p-2">{sanPhamChiTiet.kichCo.ten}</td>
                  <td className="p-2">{sanPhamChiTiet.mauSac.ten}</td>
                  <td className="p-2">{sanPhamChiTiet.deGiay.ten}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center space-x-2 mt-4">
            {/* Nút Prev */}
            <button
              onClick={prevPageCt}
              disabled={currentPageCt === 1}
              className={`w-10 h-10 flex items-center justify-center border rounded-full ${currentPageCt === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-200"
                }`}
            >
              &lt;
            </button>
            {/* Hiển thị số trang */}
            <span className="w-10 h-10 flex items-center justify-center border rounded-full font-semibold">
              {currentPageCt}
            </span>
            {/* Nút Next */}
            <button
              onClick={nextPageCt}
              disabled={currentPageCt === totalPagesCt}
              className={`w-10 h-10 flex items-center justify-center border rounded-full ${currentPageCt === totalPagesCt
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-200"
                }`}
            >
              &gt;
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
