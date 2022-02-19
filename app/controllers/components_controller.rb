class ComponentsController < ApplicationController
  before_action :set_component, only: %i[ show edit update destroy ]

  # GET /components or /components.json
  def index
    @components = Component.all
  end

  # GET /components/1 or /components/1.json
  def show
  end

  # GET /components/new
  def new
    @component = Component.new
  end

  # GET /components/1/edit
  def edit
  end

  # POST /components or /components.json
  def create
    @component = Component.new(component_params)

    respond_to do |format|
      if @component.save
        format.html { redirect_to component_url(@component), notice: "Component was successfully created." }
        format.json { render :show, status: :created, location: @component }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @component.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /components/1 or /components/1.json
  def update
    respond_to do |format|
      if @component.update(component_params)
        format.html { redirect_to component_url(@component), notice: "Component was successfully updated." }
        format.json { render :show, status: :ok, location: @component }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @component.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /components/1 or /components/1.json
  def destroy
    @component.destroy

    respond_to do |format|
      format.html { redirect_to components_url, notice: "Component was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_component
      @component = Component.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def component_params
      params.require(:component).permit(:name, :content)
    end
end
